import log from "./utils/log";
import {
  Call,
  Client,
  GroupNotification,
  LocalAuth,
  MessageMedia,
  Reaction,
  WAState,
} from "whatsapp-web.js";
import { Message } from "../types/message";
import qrcode from "qrcode-terminal";
import LoadingBar from "./utils/loadingBar";
import messageEvent from "./events/message";
import messageEdit from "./events/edit";
import groupLeave from "./events/groups/leave";
import groupJoin from "./events/groups/join";
import reaction from "./events/reaction";
import ready from "./events/ready";
import revoke from "./events/revoke";
import callEvent from "./events/call";
import DownloadMedia from "./utils/message/download";
import CheckSpamLink from "./utils/phishtank/checkSpam";
import queue from "./queue/download";
import groupAdminChanged from "./events/groups/groupAdminChanged";
import QRCode from "qrcode";
import { PUPPETEER_EXEC_PATH } from "../config";
import { createAccount } from "./services/account";

const clients = new Map<string, Client>();
let isLoadingBarStarted = false;
const loadingBar = LoadingBar("Loading Client   | {bar} | {value}%");
const qrAttemptsMap = new Map<string, number>();
const MAX_QR_ATTEMPTS = 3;

async function client(
  clientId: string,
  msg?: Message,
  isRoot = false,
): Promise<Client> {
  if (clients.has(clientId)) return clients.get(clientId)!;

  const newClient = new Client({
    puppeteer: {
      headless: true,
      args: [
        "--window-size=1280,800",
        "--disable-crash-reporter",
        "--disable-breakpad",
        "--disable-infobars",
        "--no-default-browser-check",
        "--disable-extensions",
        "--disable-component-extensions-with-background-pages",
        "--noerrdialogs",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
        "--disable-sync",
        "--metrics-recording-only",
        "--disable-hang-monitor",
      ],
      defaultViewport: { width: 1366, height: 768 },
      executablePath: PUPPETEER_EXEC_PATH,
    },
    authStrategy: new LocalAuth({
      clientId,
    }),
  });

  newClient.clientId = clientId;
  newClient.isRoot = isRoot;
  registerEvents(newClient, msg);

  await newClient.initialize();
  return newClient;
}

function registerEvents(client: Client, msg?: Message): void {
  client.on("loading_screen", (percent: number, message: string) => {
    if (!isLoadingBarStarted) {
      loadingBar.start(100, 0, { message });
      isLoadingBarStarted = true;
    }
    if (percent >= 99) loadingBar.stop();
    loadingBar.update(percent, { message });
  });

  client.on("authenticated", () => {
    const clientId = msg ? msg.clientId : client.clientId;
    log.info("Auth", `Client ${clientId} authenticated successfully.`);
    qrAttemptsMap.delete(clientId);
    createAccount(clientId, client.isRoot);
  });

  client.on("qr", async (qr: string) => {
    if (msg) {
      const clientId = client.clientId;
      const attempts = qrAttemptsMap.get(clientId) || 0;
      const newAttempts = attempts + 1;
      qrAttemptsMap.set(clientId, newAttempts);

      if (newAttempts > MAX_QR_ATTEMPTS) {
        log.error(
          "Auth",
          `Client ${clientId} exceeded max QR attempts (${MAX_QR_ATTEMPTS}). Stopping client.`,
        );
        await msg.reply("Too many QR attempts. Please try again later.");
        qrAttemptsMap.delete(clientId);
        await client.destroy();
        return;
      }

      log.info("Auth", "QR code sent to the user for authentication.");
      const qrImage = await QRCode.toBuffer(qr, { type: "png", width: 300 });
      const media = new MessageMedia(
        "image/png",
        qrImage.toString("base64"),
        "qr.png",
      );

      await msg.reply(media, undefined, {
        caption:
          "Please scan this QR code with your WhatsApp app to authenticate.",
      });
    } else {
      log.info("QR", "Scan this QR code with your WhatsApp app:");
      qrcode.generate(qr, { small: true });
    }
  });

  client.on("ready", () => ready());

  client.on("message_reaction", (react: Reaction) => {
    react.clientId = client.clientId;
    reaction(client, react);
  });

  client.on("message_create", (msg: Message) => {
    msg.clientId = client.clientId;
    CheckSpamLink(msg);
    messageEvent(msg, "create");
    queue.add(() => DownloadMedia(msg));
  });

  client.on(
    "message_edit",
    (msg: Message, newBody: string, prevBody: string) => {
      msg.clientId = client.clientId;
      msg.body = newBody;
      messageEdit(msg, newBody, prevBody);
      messageEvent(msg, "edit");
    },
  );

  client.on(
    "message_revoke_everyone",
    (msg: Message, revoked_msg?: Message) => {
      msg.clientId = client.clientId;
      revoke(msg, revoked_msg);
    },
  );

  client.on("call", (call: Call) => {
    call.clientId = client.clientId;
    callEvent(call);
  });

  client.on("group_join", (notif: GroupNotification) => {
    notif.clientId = client.clientId;
    groupJoin(notif);
  });
  client.on("group_leave", (notif: GroupNotification) => {
    notif.clientId = client.clientId;
    groupLeave(notif);
  });
  client.on("group_admin_changed", (notif: GroupNotification) => {
    notif.clientId = client.clientId;
    groupAdminChanged(notif);
  });

  client.on("auth_failure", () => {
    loadingBar.stop();
    qrAttemptsMap.delete(client.clientId);
    log.error("Auth", "Authentication failed. Please try again.");
  });

  client.on("disconnected", (reason: WAState | "LOGOUT") => {
    throw Error(`Client has been disconnected reason: ${reason}`);
  });
}

async function addAccount(accountId: string, msg?: Message, isRoot = false) {
  if (clients.has(accountId)) return;

  const createClient = await client(accountId, msg, isRoot);
  clients.set(accountId, createClient);
}

function removeAccount(accountId: string) {
  const client = clients.get(accountId);
  if (client) {
    client.logout();
    client.destroy();
    clients.delete(accountId);
  }
}

function getClient(accountId: string): Client {
  const client = clients.get(accountId);
  if (client) return client;

  throw Error(`Client with id ${accountId} not found`);
}

export { clients, addAccount, removeAccount, getClient };
export default clients;

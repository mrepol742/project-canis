import log from "./utils/log";
import {
  Call,
  Client,
  GroupNotification,
  LocalAuth,
  Message,
  Reaction,
} from "whatsapp-web.js";
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

const loadingBar = LoadingBar("Loading Client   | {bar} | {value}%");
const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath:
      process.env.PUPPETEER_EXEC_PATH || "/opt/google/chrome/google-chrome",
  },
  authStrategy: new LocalAuth(),
});
let isLoadingBarStarted = false;

client.on("loading_screen", (percent: number, message: string) => {
  if (!isLoadingBarStarted) {
    loadingBar.start(100, 0, { message });
    isLoadingBarStarted = true;
  }

  if (percent >= 99) loadingBar.stop();

  loadingBar.update(percent, { message });
});

client.on("authenticated", () =>
  log.info("Auth", "Client authenticated successfully."),
);

client.on("qr", (qr: string) => {
  // Generate and scan this code with your phone
  log.info("QR", "Scan this QR code with your WhatsApp app:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => ready());

client.on("message_reaction", (react: Reaction) => reaction(client, react));

// client.on("message", (msg) => messageEvent(msg));
client.on("message_create", (msg: Message) => messageEvent(msg, "create"));

client.on("message_edit", (msg: Message, newBody: string, prevBody: string) => {
  msg.body = newBody;
  Promise.all([messageEdit(msg, newBody, prevBody), messageEvent(msg, "edit")]);
});

client.on("message_revoke_everyone", (msg: Message, revoked_msg?: Message) =>
  revoke(msg, revoked_msg),
);

client.on("call", (call: Call) => callEvent(call));

client.on("group_join", (notif: GroupNotification) => groupJoin(notif));
client.on("group_leave", (notif: GroupNotification) => groupLeave(notif));
client.on("auth_failure", (msg: string) => {
  loadingBar.stop();
  log.error("Auth", "Authentication failed. Please try again.");
});

export { client };

import log from "./utils/log";
import {
  Client,
  GroupNotification,
  LocalAuth,
  Message,
  Reaction,
} from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import messageEvent from "./events/message";
import messageEdit from "./events/edit";
import groupLeave from "./events/groups/leave";
import groupJoin from "./events/groups/join";
import reaction from "./events/reaction";
import ready from "./events/ready";

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("loading_screen", (percent: number, message: string) =>
  log.info("loading", `..................... ${percent}%`)
);
client.on("authenticated", () =>
  log.info("auth", "Client authenticated successfully.")
);
client.on("qr", (qr: string) => {
  // Generate and scan this code with your phone
  log.info("qrcode", "Scan this QR code with your WhatsApp app:");
  qrcode.generate(qr, { small: true });
});
client.on("ready", async () => ready());
client.on("message_reaction", async (react: Reaction) =>
  reaction(client, react)
);
// client.on("message", (msg) => messageEvent(msg));
client.on("message_create", async (msg: Message) => messageEvent(msg));
client.on(
  "message_edit",
  async (msg: Message, newBody: String, prevBody: String) =>
    messageEdit(msg, newBody, prevBody)
);
client.on("group_join", async (notif: GroupNotification) => groupJoin(notif));
client.on("group_leave", async (notif: GroupNotification) => groupLeave(notif));
client.on("auth_failure", (msg: String) =>
  log.error("auth", "Authentication failed. Please try again.")
);

client.initialize();

export { client };

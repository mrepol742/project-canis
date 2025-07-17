import { Message } from "whatsapp-web.js";
import log from "npmlog";

export const command = "ping";

export default function (msg: Message) {
  log.info("Ping", "Ping command handler called");
  msg.reply("pong");
}

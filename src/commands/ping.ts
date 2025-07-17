import { Message } from "whatsapp-web.js";
import log from "npmlog";

export const command = "ping";
export const role = "user";

export default function (msg: Message) {
  msg.reply("pong");
}

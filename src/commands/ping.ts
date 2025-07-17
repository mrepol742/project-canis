import { Message } from "whatsapp-web.js";

export const command = "ping";

export default function (msg: Message) {
  msg.reply("pong");
}

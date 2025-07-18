import { Message } from "whatsapp-web.js";
import log from "../components/log";

export const command = "ping";
export const role = "user";

export default function (msg: Message) {
  msg.reply("pong");
}

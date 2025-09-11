import { Message } from "../../types/message"
import log from "../components/utils/log";

export const info = {
  command: "ping",
  description: "Check if the bot is online.",
  usage: "ping",
  example: "ping",
  role: "user",
  cooldown: 5000,
};

export default function (msg: Message) {
  if (!/^ping$/i.test(msg.body)) return;

  msg.reply("pong");
}

import { Message } from "../../types/message";
import log from "../components/utils/log";
import speedtest from "../components/utils/speedtest";

export const info = {
  command: "ping",
  description: "Check if the bot is online.",
  usage: "ping",
  example: "ping",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^ping$/.test(msg.body)) return;

  const latency = await speedtest();
  msg.reply(`pong ${latency?.ping && `${latency?.ping}ms`}`);
}

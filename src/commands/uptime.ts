import { Message } from "whatsapp-web.js";
import log from "../components/utils/log";
import os from "os";
import si from "systeminformation";

export const command = "uptime";
export const role = "user";

export const info = {
  command: "uptime",
  description: "Get the bot's uptime and process information.",
  usage: "uptime",
  example: "uptime",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const uptimeMinutes = Math.floor(process.uptime() / 60);
  const statsMessage = `
      *${uptimeMinutes} minutes*
      #${process.pid}
      `;

  await msg.reply(statsMessage);
}

import { Message } from "whatsapp-web.js";
import log from "../components/utils/log";
import os from "os";
import si from "systeminformation";

export const info = {
  command: "uptime",
  description: "Get the bot's uptime and process information.",
  usage: "uptime",
  example: "uptime",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^uptime\b/i.test(msg.body)) return;

  const uptimeMinutes = Math.floor(process.uptime() / 60);
  const statsMessage = `
      \`${uptimeMinutes} minutes\`
      
      ID: #${process.pid}
      Platform: ${os.platform()} ${os.arch()}
      `;

  await msg.reply(statsMessage);
}

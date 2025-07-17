import { Message } from "whatsapp-web.js";
import log from "npmlog";
import os from "os";

export const command = "stats";

export default async function (msg: Message) {
  try {
    const stats = {
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: process.uptime(),
    };

    const statsMessage = `
      *System Stats:*
      - Platform: ${stats.platform}
      - Architecture: ${stats.arch}
      - CPU Count: ${stats.cpuCount}
      - Total Memory: ${(stats.totalMemory / (1024 ** 3)).toFixed(2)} GB
      - Free Memory: ${(stats.freeMemory / (1024 ** 3)).toFixed(2)} GB
      - Uptime: ${(stats.uptime / 3600).toFixed(2)} hours
      - Node.js Version: ${process.version}
    `;

    await msg.reply(statsMessage);
  } catch (error) {
    log.error("Command", "Error occured while processing the request:", error);
    await msg.reply("An error occurred while processing your request.");
  }
}

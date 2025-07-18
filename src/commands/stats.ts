import { Message } from "whatsapp-web.js";
import log from "npmlog";
import os from "os";
import si from "systeminformation";

export const command = "stats";
export const role = "user";

export default async function (msg: Message) {
  const stats = {
    OS: os.release(),
    arch: os.arch(),
    cpu: os.cpus(),
    usedMemory: os.totalmem() - os.freemem(),
    totalMemory: os.totalmem(),
    uptime: process.uptime()
  };
  
  const gpuInfo = await si.graphics();
  const osInfo = await si.osInfo();

  const statsMessage = `
      *System Stats:*

      - OS: ${osInfo.distro} ${osInfo.kernel}
      - CPU: ${stats.cpu[0].model}
      - GPU: ${gpuInfo.controllers.map(c => c.model).join(", ")}
      - RAM: ${(stats.usedMemory / (1024 ** 3)).toFixed(2)} GB / ${(stats.totalMemory / (1024 ** 3)).toFixed(2)} GB
      - VRam: ${gpuInfo.controllers.map(c => c.vram).join(", ")}
      - Uptime: ${(stats.uptime / 3600).toFixed(2)} hours
      - Load Avg: ${os.loadavg().map(n => n.toFixed(2)).join(", ")}
      - Process: #${process.pid} ${process.title}
      - Node.js: ${process.version}
    `;

  await msg.reply(statsMessage);
}

import { Message } from "../../types/message";
import log from "../components/utils/log";
import os from "os";
import si from "systeminformation";
import { getUserCount, getBlockUserCount } from "../components/services/user";
import { client } from "../components/client";
import { commands } from "../components/utils/cmd/loader";

export const info = {
  command: "stats",
  description: "Get system and Node.js runtime statistics.",
  usage: "stats",
  example: "stats",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^stats$/i.test(msg.body)) return;

  // Node.js runtime stats
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  const uptime = process.uptime();

  const nodeStats = {
    rss: (mem.rss / 1024 ** 2).toFixed(2), // MB
    heapUsed: (mem.heapUsed / 1024 ** 2).toFixed(2),
    heapTotal: (mem.heapTotal / 1024 ** 2).toFixed(2),
    external: (mem.external / 1024 ** 2).toFixed(2),
    arrayBuffers: (mem.arrayBuffers / 1024 ** 2).toFixed(2),
    cpuUser: (cpu.user / 1000).toFixed(2), // ms
    cpuSystem: (cpu.system / 1000).toFixed(2), // ms
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    nodeVersion: process.version,
    platform: process.platform,
  };

  // System stats
  const stats = {
    usedMemory: os.totalmem() - os.freemem(),
    totalMemory: os.totalmem(),
    cpu: os.cpus(),
  };

  const [gpuInfo, osInfo, shell, networkInterfaces, userCount, blockUserCount] =
    await Promise.all([
      si.graphics(),
      si.osInfo(),
      si.shell(),
      si.networkInterfaces(),
      getUserCount(),
      getBlockUserCount(),
    ]);

  const statsMessage = `
\`System Monitor\`

OS: ${osInfo.distro} ${osInfo.kernel}
CPU: ${stats.cpu[0].model}
GPU: ${gpuInfo.controllers.map((c) => c.model).join(", ")}
RAM: ${(stats.usedMemory / 1024 ** 3).toFixed(2)} GB / ${(stats.totalMemory / 1024 ** 3).toFixed(2)} GB
VRAM: ${gpuInfo.controllers.map((c) => c.vram).join(", ")} MB
Shell: ${shell}
Network: ${networkInterfaces.map((iface) => `${iface.iface} ${iface.speed} Mbps`).join(", ")}
Commands: ${Object.keys(commands).length}
Users: ${userCount}
Blocked Users: ${blockUserCount}

\`Node.js Runtime\`
Node: ${nodeStats.nodeVersion} on ${nodeStats.platform}
Uptime: ${nodeStats.uptime}
Memory: ${nodeStats.heapUsed} MB / ${nodeStats.heapTotal} MB (RSS: ${nodeStats.rss} MB)
External: ${nodeStats.external} MB, ArrayBuffers: ${nodeStats.arrayBuffers} MB
CPU Time: User ${nodeStats.cpuUser} ms | System ${nodeStats.cpuSystem} ms
`;

  await msg.reply(statsMessage);
}

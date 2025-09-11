import { Message } from "../../types/message"
import log from "../components/utils/log";
import os from "os";
import si from "systeminformation";
import { getUserCount, getBlockUserCount } from "../components/services/user";
import { client } from "../components/client";
import { commands } from "../index";

export const info = {
  command: "stats",
  description: "Get system statistics including CPU, RAM, GPU, and more.",
  usage: "stats",
  example: "stats",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^stats$/i.test(msg.body)) return;
  const stats = {
    OS: os.release(),
    arch: os.arch(),
    cpu: os.cpus(),
    usedMemory: os.totalmem() - os.freemem(),
    totalMemory: os.totalmem(),
  };

  const [
    gpuInfo,
    osInfo,
    shell,
    networkInterfaces,
    userCount,
    blockUserCount,
  ] = await Promise.all([
    si.graphics(),
    si.osInfo(),
    si.shell(),
    si.networkInterfaces(),
    getUserCount(),
    getBlockUserCount()
  ]);

  const statsMessage = `
      \`System Monitor\`

      OS: ${osInfo.distro} ${osInfo.kernel}
      CPU: ${stats.cpu[0].model}
      GPU: ${gpuInfo.controllers.map((c) => c.model).join(", ")}
      RAM: ${(stats.usedMemory / 1024 ** 3).toFixed(2)} GB / ${(
    stats.totalMemory /
    1024 ** 3
  ).toFixed(2)} GB
      VRam: ${gpuInfo.controllers.map((c) => c.vram).join(", ")} MB
      Shell: ${shell}
      Network: ${networkInterfaces
        .map((iface) => `${iface.iface} ${iface.speed} Mbps`)
        .join(", ")}
      Commands: ${Object.keys(commands).length}
      Users: ${userCount}
      Blocked Users: ${blockUserCount}
    `;

  await msg.reply(statsMessage);
}

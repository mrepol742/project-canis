"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const os_1 = __importDefault(require("os"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const user_1 = require("../components/services/user");
const index_1 = require("../index");
exports.info = {
    command: "stats",
    description: "Get system statistics including CPU, RAM, GPU, and more.",
    usage: "stats",
    example: "stats",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^stats$/i.test(msg.body))
        return;
    const stats = {
        OS: os_1.default.release(),
        arch: os_1.default.arch(),
        cpu: os_1.default.cpus(),
        usedMemory: os_1.default.totalmem() - os_1.default.freemem(),
        totalMemory: os_1.default.totalmem(),
    };
    const [gpuInfo, osInfo, shell, networkInterfaces, userCount, blockUserCount,] = await Promise.all([
        systeminformation_1.default.graphics(),
        systeminformation_1.default.osInfo(),
        systeminformation_1.default.shell(),
        systeminformation_1.default.networkInterfaces(),
        (0, user_1.getUserCount)(),
        (0, user_1.getBlockUserCount)()
    ]);
    const statsMessage = `
      \`System Monitor\`

      OS: ${osInfo.distro} ${osInfo.kernel}
      CPU: ${stats.cpu[0].model}
      GPU: ${gpuInfo.controllers.map((c) => c.model).join(", ")}
      RAM: ${(stats.usedMemory / 1024 ** 3).toFixed(2)} GB / ${(stats.totalMemory /
        1024 ** 3).toFixed(2)} GB
      VRam: ${gpuInfo.controllers.map((c) => c.vram).join(", ")} MB
      Shell: ${shell}
      Network: ${networkInterfaces
        .map((iface) => `${iface.iface} ${iface.speed} Mbps`)
        .join(", ")}
      Commands: ${Object.keys(index_1.commands).length}
      Users: ${userCount}
      Blocked Users: ${blockUserCount}
    `;
    await msg.reply(statsMessage);
}

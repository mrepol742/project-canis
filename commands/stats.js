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
    description: "Get system and Node.js runtime statistics.",
    usage: "stats",
    example: "stats",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^stats$/i.test(msg.body))
        return;
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const uptime = process.uptime();
    const nodeStats = {
        rss: (mem.rss / 1024 ** 2).toFixed(2),
        heapUsed: (mem.heapUsed / 1024 ** 2).toFixed(2),
        heapTotal: (mem.heapTotal / 1024 ** 2).toFixed(2),
        external: (mem.external / 1024 ** 2).toFixed(2),
        arrayBuffers: (mem.arrayBuffers / 1024 ** 2).toFixed(2),
        cpuUser: (cpu.user / 1000).toFixed(2),
        cpuSystem: (cpu.system / 1000).toFixed(2),
        uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        nodeVersion: process.version,
        platform: process.platform,
    };
    const stats = {
        usedMemory: os_1.default.totalmem() - os_1.default.freemem(),
        totalMemory: os_1.default.totalmem(),
        cpu: os_1.default.cpus(),
    };
    const [gpuInfo, osInfo, shell, networkInterfaces, userCount, blockUserCount] = await Promise.all([
        systeminformation_1.default.graphics(),
        systeminformation_1.default.osInfo(),
        systeminformation_1.default.shell(),
        systeminformation_1.default.networkInterfaces(),
        (0, user_1.getUserCount)(),
        (0, user_1.getBlockUserCount)(),
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
Commands: ${Object.keys(index_1.commands).length}
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

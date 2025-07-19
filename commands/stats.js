"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const os_1 = __importDefault(require("os"));
const systeminformation_1 = __importDefault(require("systeminformation"));
exports.command = "stats";
exports.role = "user";
async function default_1(msg) {
    const stats = {
        OS: os_1.default.release(),
        arch: os_1.default.arch(),
        cpu: os_1.default.cpus(),
        usedMemory: os_1.default.totalmem() - os_1.default.freemem(),
        totalMemory: os_1.default.totalmem(),
    };
    const [gpuInfo, osInfo, shell, networkInterfaces] = await Promise.all([
        systeminformation_1.default.graphics(),
        systeminformation_1.default.osInfo(),
        systeminformation_1.default.shell(),
        systeminformation_1.default.networkInterfaces()
    ]);
    const statsMessage = `
      *System Stats*

      - OS: ${osInfo.distro} ${osInfo.kernel}
      - CPU: ${stats.cpu[0].model}
      - GPU: ${gpuInfo.controllers.map(c => c.model).join(", ")}
      - RAM: ${(stats.usedMemory / (1024 ** 3)).toFixed(2)} GB / ${(stats.totalMemory / (1024 ** 3)).toFixed(2)} GB
      - VRam: ${gpuInfo.controllers.map(c => c.vram).join(", ")} MB
      - Load Avg: ${os_1.default.loadavg().map(n => n.toFixed(2)).join(", ")}
      - Process: #${process.pid} ${process.title}
      - Shell: ${shell}
      - Network: ${networkInterfaces.map(iface => `${iface.iface} ${iface.speed} Mbps`).join(", ")}
      - Node.js: ${process.version}
    `;
    await msg.reply(statsMessage);
}

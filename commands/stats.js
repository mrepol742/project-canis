"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
exports.default = default_1;
const npmlog_1 = __importDefault(require("npmlog"));
const os_1 = __importDefault(require("os"));
exports.command = "stats";
async function default_1(msg) {
    try {
        const stats = {
            platform: os_1.default.platform(),
            arch: os_1.default.arch(),
            cpuCount: os_1.default.cpus().length,
            totalMemory: os_1.default.totalmem(),
            freeMemory: os_1.default.freemem(),
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
    }
    catch (error) {
        npmlog_1.default.error("Command", "Error occured while processing the request:", error);
        await msg.reply("An error occurred while processing your request.");
    }
}

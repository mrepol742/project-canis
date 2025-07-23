"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const os_1 = __importDefault(require("os"));
exports.info = {
    command: "uptime",
    description: "Get the bot's uptime and process information.",
    usage: "uptime",
    example: "uptime",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^uptime\b/i.test(msg.body))
        return;
    const uptimeMinutes = Math.floor(process.uptime() / 60);
    const statsMessage = `
      \`${uptimeMinutes} minutes\`
      
      ID: #${process.pid}
      Platform: ${os_1.default.platform()} ${os_1.default.arch()}
      `;
    await msg.reply(statsMessage);
}

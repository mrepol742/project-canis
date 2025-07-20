"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = default_1;
exports.command = "uptime";
exports.role = "user";
exports.info = {
    command: "uptime",
    description: "Get the bot's uptime and process information.",
    usage: "uptime",
    example: "uptime",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const uptimeMinutes = Math.floor(process.uptime() / 60);
    const statsMessage = `
      *${uptimeMinutes} minutes*
      #${process.pid}
      `;
    await msg.reply(statsMessage);
}

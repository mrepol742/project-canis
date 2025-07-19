"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
exports.command = "uptime";
exports.role = "user";
async function default_1(msg) {
    const uptimeMinutes = Math.floor(process.uptime() / 60);
    const statsMessage = `
      *${uptimeMinutes} minutes*
      #${process.pid}
      `;
    await msg.reply(statsMessage);
}

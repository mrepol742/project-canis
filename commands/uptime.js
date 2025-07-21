"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
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
      
      Process ID:#${process.pid}
      `;
    await msg.reply(statsMessage);
}

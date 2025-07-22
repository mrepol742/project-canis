"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "google",
    description: "Search Google and return the first result.",
    usage: "google <query>",
    example: "google weather today",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^google\b\s*/i, "").trim();
    if (query.length !== 0)
        return;
    await msg.reply(`https://letmegooglethat.com/?q=${encodeURIComponent(query)}`);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "fork",
    description: "Fork this bot on GitHub.",
    usage: "fork",
    example: "fork",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^fork$/i.test(msg.body))
        return;
    const text = `
  \`Canis for WhatsApp\`
    mrepol742/project-canis

  \`Canis for Telegram\`
    mrepol742/project-canis-ts

    This bot is not affiliated, endorsed, partner, or connected to Meta.
    Use it at your own RISK.

    Type \`Legal\` for more information.
    `;
    await msg.reply(text);
}

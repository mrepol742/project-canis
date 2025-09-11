"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "dcma",
    description: "Display the DCMA policy of the bot.",
    usage: "dcma",
    example: "dcma",
    role: "legal",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^dcma$/i.test(msg.body))
        return;
    const text = `
  \`DCMA\`
    This bot is intended for educational and entertainment purposes only.
    The owner of this bot does not claim ownership of any content shared through it.
    If you believe that your content has been used without permission,
    please contact us to resolve the issue.
    `;
    await msg.reply(text);
}

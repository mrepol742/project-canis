"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "legal",
    description: "List down legal commands.",
    usage: "legal",
    example: "legal",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^legal$/i.test(msg.body))
        return;
    const text = `
    \`Legal Commands\`

       \`terms\`
       Display the terms of service of the bot.

       \`privacy\`
       Display the privacy policy of the bot.

       \`dcma\`
       Display the DCMA policy of the bot.

       \`contact\`
       mrepol742@gmail.com
    `;
    await msg.reply(text);
}

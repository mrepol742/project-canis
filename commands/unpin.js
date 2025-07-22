"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "unpin",
    description: "Unpin a previously pinned message.",
    usage: "unpin",
    example: "unpin",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^unpin$/i.test(msg.body))
        return;
    if (!msg.hasQuotedMsg) {
        await msg.reply("Please reply to the message you want to upin.");
        return;
    }
    const quotedMsg = await msg.getQuotedMessage();
    if (!quotedMsg.body) {
        await msg.reply("Please reply to a pinnmed message.");
        return;
    }
    await quotedMsg.unpin();
}

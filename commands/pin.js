"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "pin",
    description: "Pin a message for a long duration.",
    usage: "pin",
    example: "pin",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^pin$/i.test(msg.body))
        return;
    if (!msg.hasQuotedMsg) {
        await msg.reply("Please reply to the message you want to pin.");
        return;
    }
    const quotedMsg = await msg.getQuotedMessage();
    if (!quotedMsg.body) {
        await msg.reply("Please reply to a message with the new status or name.");
        return;
    }
    await quotedMsg.pin(24 * 60 * 60 * 1000 * 1000);
}

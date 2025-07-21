"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "unsend",
    description: "Unsend a message by quoting it.",
    usage: "unsend",
    example: "unsend",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^unsend$/i.test(msg.body))
        return;
    if (!msg.hasQuotedMsg) {
        await msg.reply("Please reply the message you want to unsend.");
        return;
    }
    const quoted = await msg.getQuotedMessage();
    if (quoted.fromMe) {
        await quoted.delete(true, true);
    }
}

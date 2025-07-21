"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "test",
    description: "A simple test command.",
    usage: "test",
    example: "test",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^test$/i.test(msg.body))
        return;
    await msg.reply("This is a test response.");
}

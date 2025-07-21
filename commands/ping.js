"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
exports.info = {
    command: "ping",
    description: "Check if the bot is online.",
    usage: "ping",
    example: "ping",
    role: "user",
    cooldown: 5000,
};
function default_1(msg) {
    if (!/^ping$/i.test(msg.body))
        return;
    msg.reply("pong");
}

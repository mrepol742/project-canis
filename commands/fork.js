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
    await msg.reply("Fork this bot at https://github.com/mrepol742/project-canis or contribute to the project by submitting issues or pull requests.");
}

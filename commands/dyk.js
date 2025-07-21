"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const data_1 = require("../components/utils/data");
exports.info = {
    command: "dyk",
    description: "Did you know? Get a random trivia.",
    usage: "dyk",
    example: "dyk",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^dyk$/i.test(msg.body))
        return;
    const response = data_1.dyk[Math.floor(Math.random() * data_1.dyk.length)];
    if (response.length === 0)
        return await msg.reply("I dont know...");
    await msg.reply(response);
}

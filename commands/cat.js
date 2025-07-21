"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const data_1 = require("../components/utils/data");
exports.info = {
    command: "cat",
    description: "Get a random cat trivia.",
    usage: "cat",
    example: "cat",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^cat$/i.test(msg.body))
        return;
    const response = data_1.cat[Math.floor(Math.random() * data_1.cat.length)];
    if (response.length === 0)
        return await msg.reply("Cat is silent...");
    await msg.reply(response);
}

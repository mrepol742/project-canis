"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const data_1 = require("../components/utils/data");
exports.info = {
    command: "joke",
    description: "Get a random joke.",
    usage: "joke",
    example: "joke",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^joke$/i.test(msg.body))
        return;
    const response = data_1.joke[Math.floor(Math.random() * data_1.joke.length)];
    if (response.length === 0)
        return await msg.reply("I don't have any jokes right now...");
    await msg.reply(response);
}

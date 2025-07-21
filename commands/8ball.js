"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const data_1 = require("../components/utils/data");
exports.info = {
    command: "8ball",
    description: "Ask the magic 8-ball a question.",
    usage: "8ball <question>",
    example: "8ball Will I win the lottery?",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^8ball\b/i.test(msg.body))
        return;
    const response = data_1.ball[Math.floor(Math.random() * data_1.ball.length)];
    if (response.length === 0)
        return await msg.reply("The ball is silent...");
    await msg.reply(response);
}

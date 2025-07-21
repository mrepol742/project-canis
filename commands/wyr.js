"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const data_1 = require("../components/utils/data");
exports.info = {
    command: "wyr",
    description: "Would you rather? Get a random 'Would You Rather' question.",
    usage: "wyr",
    example: "wyr",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^wyr$/i.test(msg.body))
        return;
    const response = data_1.wyr[Math.floor(Math.random() * data_1.wyr.length)];
    if (response.length === 0)
        return await msg.reply("I don't have any jokes right now...");
    const text = `
  \`Would you rather?\`

  ${response.ops1}
  or
  ${response.ops2}
  `;
    await msg.reply(text);
}

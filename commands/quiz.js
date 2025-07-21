"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const data_1 = require("../components/utils/data");
exports.info = {
    command: "quiz",
    description: "Get a random quiz question.",
    usage: "quiz",
    example: "quiz",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^quiz$/i.test(msg.body))
        return;
    const response = data_1.quiz[Math.floor(Math.random() * data_1.quiz.length)];
    if (response.length === 0)
        return await msg.reply("I don't have any quiz questions right now...");
    let text = `
  \`${response.question}\`
  `;
    if (response.choices && response.choices.length > 0) {
        text += `
    *Options:*
    ${response.choices
            .map((choice, index) => `${index + 1}. ${choice}`)
            .join("\n    ")}
    `;
    }
    await msg.reply(text);
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const data_1 = require("../components/utils/data");
const quiz_1 = require("../components/services/quiz");
const log_1 = __importDefault(require("../components/utils/log"));
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
    const id = Math.floor(Math.random() * data_1.quiz.length);
    const response = data_1.quiz[id];
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
    const messageReturn = await msg.reply(text);
    await Promise.all([
        (0, quiz_1.newQuizAttempt)(messageReturn, id.toString()),
        log_1.default.info("quiz", `Quiz question sent: ${response.question}`),
    ]);
}

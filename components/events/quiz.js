"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const quiz_1 = require("../services/quiz");
const data_1 = require("../utils/data");
const done = [
    "Correct! 🎉",
    "Well done! 👍",
    "Nice job! ✅",
    "You got it! 🥳",
    "That's right! 👏",
    "Excellent! 🌟",
    "Great answer! 💡",
    "Spot on! 🎯",
    "Perfect! 🏆",
    "You nailed it! 🔥",
];
async function default_1(msg, quoted) {
    if (!quoted.body)
        return false;
    const quizAttempts = await (0, quiz_1.getQuizAttempts)(quoted);
    if (quizAttempts) {
        const question = data_1.quiz[parseInt(quizAttempts.qid)];
        if (msg.body.trim().toLowerCase() === question.answer.toLowerCase()) {
            await Promise.all([
                msg.reply(done[Math.floor(Math.random() * done.length)]),
                (0, quiz_1.setQuizAttemptAnswered)(msg, quoted),
            ]);
            return true;
        }
    }
    return false;
}

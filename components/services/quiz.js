"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newQuizAttempt = newQuizAttempt;
exports.getQuizAttempts = getQuizAttempts;
exports.setQuizAttemptAnswered = setQuizAttemptAnswered;
const prisma_1 = require("../prisma");
const log_1 = __importDefault(require("../utils/log"));
async function newQuizAttempt(msg, qid) {
    try {
        const lid = msg.id.remote.split("@")[0];
        await prisma_1.prisma.quiz.create({
            data: {
                mid: msg.id.id,
                lid,
                qid,
            },
        });
    }
    catch (error) {
        log_1.default.error("Database", "Failed to add quiz.", error);
    }
}
async function getQuizAttempts(msg) {
    try {
        if (!msg.id || !msg.id.remote)
            return [];
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { mid: msg.id.id, answeredAt: null },
        });
        return quiz;
    }
    catch (error) {
        log_1.default.error("Database", `Failed to get quiz attempts.`, error);
    }
    return null;
}
async function setQuizAttemptAnswered(msg, quoted) {
    try {
        if (!quoted.id || !quoted.id.remote)
            return;
        await Promise.all([
            prisma_1.prisma.quiz.update({
                where: { mid: quoted.id.id },
                data: { answeredAt: new Date() },
            }),
            prisma_1.prisma.user.update({
                where: {
                    lid: msg.author ? msg.author.split("@")[0] : msg.from.split("@")[0],
                },
                data: {
                    quizAnswered: {
                        increment: 1,
                    },
                },
            }),
        ]);
    }
    catch (error) {
        log_1.default.error("Database", `Failed to set quiz attempt as answered.`, error);
    }
}

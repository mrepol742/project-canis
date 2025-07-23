"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/utils/log"));
const agentHandler_1 = __importDefault(require("../components/ai/agentHandler"));
const data_1 = require("../components/utils/data");
exports.info = {
    command: "ai",
    description: "Interact with the AI agent.",
    usage: "ai <query>",
    example: "ai What is the weather like today?",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^ai\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply(data_1.greetings[Math.floor(Math.random() * data_1.greetings.length)]);
        return;
    }
    const text = await (0, agentHandler_1.default)(`You are an AI agent. Respond to the user's query in no more than 3 sentences.
    If asked about other AI agents like 'sim', 'mj', or 'chad', mention that their commands are !sim, !mj, or !chad.
    Adapt your response style to match how those agents typically reply.
    User query: ${query}
    `);
    if (!text) {
        log_1.default.error("ai", "No response generated.");
        await msg.reply("Sorry, I couldn't generate a response. Please try again.");
        return;
    }
    await msg.reply(text);
}

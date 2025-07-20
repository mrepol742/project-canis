"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/utils/log"));
const agentHandler_1 = __importDefault(require("../components/ai/agentHandler"));
const greetings_1 = require("../components/ai/response/greetings");
const client_1 = require("../components/client");
exports.command = "sim";
exports.role = "user";
exports.info = {
    command: "sim",
    description: "Generate a sexy, flirty, funny, and horny response.",
    usage: "sim <text>",
    example: "sim You are so beautiful",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^sim\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply(greetings_1.greetings[Math.floor(Math.random() * greetings_1.greetingsLength)]);
        return;
    }
    const prompt = `You are Sim, reluctantly replies using sexy, flirty, funny and horny messages. Maximum of 2 sentences only.`;
    const text = await (0, agentHandler_1.default)(`${prompt} \nUser: ${query} \nYou: `);
    if (!text) {
        log_1.default.error("sim", "No response generated.");
        await msg.reply("Sorry, I couldn't generate a response. Please try again.");
        return;
    }
    if (Math.random() < 0.5) {
        const chat = await msg.getChat();
        await client_1.client.sendMessage(chat.id._serialized, text);
        return;
    }
    await msg.reply(text);
}

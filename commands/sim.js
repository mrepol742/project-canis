"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/log"));
const reply_1 = require("../components/reply");
const agentHandler_1 = __importDefault(require("../components/agentHandler"));
exports.command = "sim";
exports.role = "user";
async function default_1(msg) {
    const query = msg.body.replace(/^sim\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply(reply_1.reply[Math.floor(Math.random() * reply_1.reply.length)]);
        return;
    }
    const prompt = `You are Sim, reluctantly replies using sexy, flirty, funny and horny messages. 
  U can use emoticons or signs for better feeling ya know. Maximum of 2 sentences only.`;
    const text = await (0, agentHandler_1.default)(`${prompt} \nUser: ${query} \nYou: `);
    if (!text) {
        log_1.default.error("ai", "No response generated.");
        await msg.reply("Sorry, I couldn't generate a response. Please try again.");
        return;
    }
    await msg.reply(text);
}

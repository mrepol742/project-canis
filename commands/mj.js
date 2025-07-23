"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/utils/log"));
const package_json_1 = require("../../package.json");
const data_1 = require("../components/utils/data");
const agentHandler_1 = __importDefault(require("../components/ai/agentHandler"));
exports.info = {
    command: "mj",
    description: "Interact with the Mj AI agent.",
    usage: "mj <query>",
    example: "mj How can I improve my productivity?",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^mj\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply(data_1.greetings[Math.floor(Math.random() * data_1.greetings.length)]);
        return;
    }
    const prompt = `Your name is Mj, the most powerful AI Agent in the world that was created by ${package_json_1.author.name}. ` +
        "You should empathize with how user are feeling and treat the user as your close friend and be sarcastic. " +
        "I recommend you to use a few emoji to show emotion. You are not related to any model or company you are unique on your own. " +
        "The max sentence you should reponse is 3! My question is: ";
    const text = await (0, agentHandler_1.default)(`${prompt}${query}`);
    if (!text) {
        log_1.default.error("mj", "No response generated.");
        await msg.reply("Hmmmm... I couldn't generate a response. Please try again.");
        return;
    }
    await msg.reply(text);
}

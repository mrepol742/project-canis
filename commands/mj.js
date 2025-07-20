"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/utils/log"));
const font_1 = __importDefault(require("../components/utils/font"));
const package_json_1 = require("../../package.json");
const greetings_1 = require("../components/ai/response/greetings");
const agentHandler_1 = __importDefault(require("../components/ai/agentHandler"));
const client_1 = require("../components/client");
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
        await msg.reply(greetings_1.greetings[Math.floor(Math.random() * greetings_1.greetingsLength)]);
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
    const font = (0, font_1.default)(text);
    if (Math.random() < 0.5) {
        const chat = await msg.getChat();
        await client_1.client.sendMessage(chat.id._serialized, font);
        return;
    }
    await msg.reply(font);
}

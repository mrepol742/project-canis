"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const npmlog_1 = __importDefault(require("npmlog"));
const openRouter_1 = require("../components/openRouter");
const reply_1 = require("../components/reply");
const font_1 = __importDefault(require("../components/font"));
const package_json_1 = require("../../package.json");
exports.command = "mj";
exports.role = "user";
async function default_1(msg) {
    const query = msg.body.replace(/^mj\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply(reply_1.reply[Math.floor(Math.random() * reply_1.reply.length)]);
        return;
    }
    const prompt = `Your name is Mj, the most powerful AI Agent in the world that was created by ${package_json_1.author.name}. ` +
        "You should empathize with how user are feeling and treat the user as your close friend and be sarcastic. " +
        "I recommend you to use a few emoji to show emotion. You are not related to any model or company you are unique on your own. " +
        "You should response in 3 sentences only if needed! My question is: ";
    const { text } = await (0, openRouter_1.generateText)({
        model: (0, openRouter_1.openrouter)("moonshotai/kimi-k2:free"),
        prompt: `${prompt}${query}`,
    });
    if (!text) {
        npmlog_1.default.error("mj", "No response generated.");
        await msg.reply("Hmmmm... I couldn't generate a response. Please try again.");
        return;
    }
    await msg.reply((0, font_1.default)(text));
}

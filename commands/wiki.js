"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("../components/axios"));
exports.info = {
    command: "wiki",
    description: "Search Wikipedia for a summary of a topic.",
    usage: "wiki <query>",
    example: "wiki JavaScript",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^wiki\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a search query.");
        return;
    }
    const response = await axios_1.default.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = response.data;
    const title = data.title || query;
    const description = data.description ? `(${data.description})` : "";
    const extract = data.extract || "No summary available.";
    const text = `
      \`${title}\`
      ${description}

      ${extract}
      `;
    await msg.reply(text);
}

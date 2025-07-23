"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
exports.info = {
    command: "go",
    description: "Search with duckduckgo.",
    usage: "go <query>",
    example: "go weather today",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^go\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a search query.");
        return;
    }
    const response = await axios_1.default.get("https://api.duckduckgo.com/", {
        params: {
            q: query,
            format: "json",
            pretty: 1,
            no_redirect: 1,
            no_html: 1,
        },
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
    });
    const data = response.data;
    if (data.AbstractText) {
        await msg.reply(`${data.AbstractText}\n\n${data.AbstractURL}`);
        return;
    }
    if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
        const firstTopic = data.RelatedTopics.find((t) => typeof t.Text === "string" && t.FirstURL) || data.RelatedTopics[0];
        if (firstTopic && firstTopic.Text && firstTopic.FirstURL) {
            await msg.reply(`${firstTopic.Text}\n${firstTopic.FirstURL}`);
            return;
        }
    }
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    await msg.reply(`Why dont you duckduck it yourself? Heres the link: \n${searchUrl}`);
}

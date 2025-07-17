"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const npmlog_1 = __importDefault(require("npmlog"));
exports.command = "go";
async function default_1(msg) {
    const query = msg.body.replace(/^go\s+/i, "").trim();
    if (!query) {
        await msg.reply("Please provide a search query.");
        return;
    }
    try {
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
            await msg.reply(`${data.AbstractText}\n${data.AbstractURL}`);
            return;
        }
        // If no abstract, try to get the first related topic
        if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
            const firstTopic = data.RelatedTopics.find((t) => typeof t.Text === "string" && t.FirstURL) || data.RelatedTopics[0];
            if (firstTopic && firstTopic.Text && firstTopic.FirstURL) {
                await msg.reply(`${firstTopic.Text}\n${firstTopic.FirstURL}`);
                return;
            }
        }
        // Fallback
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        await msg.reply(`DuckDuckGo search results for "${query}":\n${searchUrl}`);
    }
    catch (error) {
        npmlog_1.default.error("Command", "Error fetching DuckDuckGo results:", error);
        await msg.reply("Failed to search DuckDuckGo.");
    }
}

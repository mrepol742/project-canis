"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
exports.command = "wiki";
exports.role = "user";
async function default_1(msg) {
    const query = msg.body.replace(/^wiki\s+/i, "").trim();
    if (!query) {
        await msg.reply("Please provide a search query.");
        return;
    }
    const response = await axios_1.default.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = response.data;
    const title = data.title || query;
    const description = data.description ? `(${data.description})` : "";
    const extract = data.extract || "No summary available.";
    await msg.reply(`${title} ${description}\n${extract}`);
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const puppeteer_1 = __importDefault(require("puppeteer"));
const promises_1 = __importDefault(require("fs/promises"));
exports.info = {
    command: "screenshot",
    description: "Take a screenshot of a webpage.",
    usage: "screenshot <url>",
    example: "screenshot https://example.com",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^screenshot\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a URL to take a screenshot of.");
        return;
    }
    if (!/^https?:\/\//i.test(query)) {
        await msg.reply("Please provide a valid URL starting with http:// or https://");
        return;
    }
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.goto(query, {
        waitUntil: "networkidle2",
        timeout: 60000,
    });
    const tempDir = "./.temp";
    await promises_1.default.mkdir(tempDir, { recursive: true });
    const path = `${tempDir}/${Date.now()}.png`;
    await page.screenshot({ path });
    await browser.close();
    const media = whatsapp_web_js_1.MessageMedia.fromFilePath(path);
    await msg.reply(media);
    await promises_1.default.unlink(path);
}

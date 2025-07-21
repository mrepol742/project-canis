"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const axios_1 = __importDefault(require("axios"));
const log_1 = __importDefault(require("../components/utils/log"));
const promises_1 = __importDefault(require("fs/promises"));
exports.info = {
    command: "pooh",
    description: "Generate a Pooh image with two texts.",
    usage: "pooh <text1> | <text2>",
    example: "pooh I love you | I love you too",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const args = msg.body
        .replace(/^pooh\b\s*/i, "")
        .trim()
        .split("|")
        .map((s) => s.trim());
    if (args.length < 2 || !args[0] || !args[1]) {
        await msg.reply("Please provide two texts separated by '|'. Example: pooh text1 | text2");
        return;
    }
    const [text1, text2] = args;
    await axios_1.default
        .get(`https://api.popcat.xyz/pooh?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`, {
        responseType: "arraybuffer",
    })
        .then(async (response) => {
        const tempDir = "./.temp";
        await promises_1.default.mkdir(tempDir, { recursive: true });
        const tempPath = `${tempDir}/${Date.now()}.png`;
        await promises_1.default.writeFile(tempPath, response.data);
        const media = whatsapp_web_js_1.MessageMedia.fromFilePath(tempPath);
        await msg.reply(media);
        await promises_1.default.unlink(tempPath);
    })
        .catch(async (error) => {
        log_1.default.error("pooh", `Error fetching image: ${error.message}`);
        await msg.reply("Error fetching image. Please try again later.");
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
exports.info = {
    command: "meme",
    description: "Fetch a random meme image.",
    usage: "meme",
    example: "meme",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^meme$/i.test(msg.body))
        return;
    const result = await axios_1.default.get("https://api.popcat.xyz/meme");
    const response = await axios_1.default.get(result.data.content.image, {
        responseType: "arraybuffer",
    });
    const tempDir = "./.temp";
    await promises_1.default.mkdir(tempDir, { recursive: true });
    const tempPath = `${tempDir}/meme_${Date.now()}.png`;
    await promises_1.default.writeFile(tempPath, response.data);
    const media = whatsapp_web_js_1.MessageMedia.fromFilePath(tempPath);
    await msg.reply(media);
    await promises_1.default.unlink(tempPath);
}

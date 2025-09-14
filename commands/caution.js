"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const axios_1 = __importDefault(require("../components/axios"));
const promises_1 = __importDefault(require("fs/promises"));
exports.info = {
    command: "caution",
    description: "Generate a caution image with the provided text.",
    usage: "caution <text>",
    example: "caution This is a caution message!",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^caution\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a text.");
        return;
    }
    const response = await axios_1.default.get(`https://api.popcat.xyz/caution?text=${encodeURIComponent(query)}`, {
        responseType: "arraybuffer",
    });
    const tempDir = "./.temp";
    await promises_1.default.mkdir(tempDir, { recursive: true });
    const tempPath = `${tempDir}/${Date.now()}.png`;
    await promises_1.default.writeFile(tempPath, response.data);
    const media = whatsapp_web_js_1.MessageMedia.fromFilePath(tempPath);
    await msg.reply(media);
    await promises_1.default.unlink(tempPath);
}

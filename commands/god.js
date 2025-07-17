"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const axios_1 = __importDefault(require("axios"));
const npmlog_1 = __importDefault(require("npmlog"));
const promises_1 = __importDefault(require("fs/promises"));
exports.command = "god";
exports.role = "user";
async function default_1(msg) {
    const query = msg.body.replace(/^god\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a text.");
        return;
    }
    await axios_1.default
        .get(`https://api.popcat.xyz/unforgivable?text=${encodeURIComponent(query)}`, {
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
        npmlog_1.default.error("god", `Error fetching image: ${error.message}`);
        await msg.reply("Error fetching image. Please try again later.");
    });
}

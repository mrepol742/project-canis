"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const fb_downloader_scrapper_1 = require("fb-downloader-scrapper");
const log_1 = __importDefault(require("../components/utils/log"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
exports.info = {
    command: "fbdl",
    description: "Download Facebook videos.",
    usage: "fbdl <facebook_url>",
    example: "fbdl https://www.facebook.com/watch?v=1234567890",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^fbdl\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a facebook url.");
        return;
    }
    const facebookUrlRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+$/i;
    if (!facebookUrlRegex.test(query)) {
        await msg.reply("Please provide a valid Facebook link.");
        return;
    }
    (0, fb_downloader_scrapper_1.getFbVideoInfo)(query)
        .then(async (result) => {
        if (!result.url)
            return await msg.reply("No video found at the provided URL.");
        await axios_1.default
            .get(result.hd, { responseType: "arraybuffer" })
            .then(async (response) => {
            const tempDir = "./.temp";
            await fs_1.default.mkdirSync(tempDir, { recursive: true });
            const tempPath = `${tempDir}/fbdl_${Date.now()}.mp4`;
            await fs_1.default.writeFileSync(tempPath, response.data);
            const audioBuffer = fs_1.default.readFileSync(tempPath);
            const media = new whatsapp_web_js_1.MessageMedia("audio/mpeg", audioBuffer.toString("base64"), `${result.title}.mp4`);
            await msg.reply(media, msg.from);
            await fs_1.default.promises.unlink(tempPath);
        })
            .catch(async (error) => {
            log_1.default.error("fbdl", `Error downloading video: ${error.message}`);
            await msg.reply("Error downloading video. Please try again later.");
        });
    })
        .catch(async (err) => {
        log_1.default.error("fbdl", `Error fetching video info: ${err.message}`);
        await msg.reply("Error fetching video info. Please try again later.");
    });
}

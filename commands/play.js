"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = play;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const innertube_1 = __importDefault(require("../components/innertube"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const client_1 = require("../components/client");
exports.command = "play";
exports.role = "admin";
exports.info = {
    command: "play",
    description: "Play a YouTube video by searching for it.",
    usage: "play <query>",
    example: "play Never Gonna Give You Up",
    role: "admin",
    cooldown: 5000,
};
function isVideoNode(node) {
    return node?.type === "Video" && typeof node.video_id === "string";
}
async function play(msg) {
    const query = msg.body.replace(/^play\b\s*/i, "").trim();
    if (!query) {
        await msg.reply("Please provide a search query.");
        return;
    }
    const yt = await (0, innertube_1.default)();
    const search = await yt.search(query, { type: "video" });
    const video = search.results.find((node) => isVideoNode(node));
    if (!video) {
        await msg.reply("Unable to find resources for the given query.");
        return;
    }
    const videoId = video.video_id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const title = video.title.toString();
    const duration = video.length_text?.toString() || "unknown";
    await msg.reply(`🎵 Downloading audio for *${title}* (${duration})`);
    const filePath = path_1.default.resolve(__dirname, `../../.temp/audio-${videoId}.webm`);
    const audioStream = (0, ytdl_core_1.default)(videoUrl, {
        filter: "audioonly",
        quality: "highestaudio",
    });
    const writeStream = fs_1.default.createWriteStream(filePath);
    audioStream.pipe(writeStream);
    await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
    });
    const audioBuffer = fs_1.default.readFileSync(filePath);
    const media = new whatsapp_web_js_1.MessageMedia("audio/webm", audioBuffer.toString("base64"), `audio-${videoId}.webm`);
    await client_1.client.sendMessage(msg.from, media, {
        caption: `🎶 *${title}*`,
    });
    fs_1.default.unlinkSync(filePath);
}

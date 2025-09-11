"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { Innertube, UniversalCache, Utils } = require("youtubei.js");
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
exports.info = {
    command: "video",
    description: "Play a YouTube video by searching for it.",
    usage: "video <query>",
    example: "video Never Gonna Give You Up",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^video\b\s*/i, "").trim();
    if (!query) {
        await msg.reply("Please provide a search query.");
        return;
    }
    const yt = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
    });
    const search = await yt.search(query, { type: "video" });
    const video = search.results[0];
    if (!video) {
        await msg.reply("Unable to find resources for the given query.");
        return;
    }
    if (video.length && video.length.seconds > 600) {
        await msg.reply("Sorry, only videos shorter than 10 minutes can be downloaded.");
        return;
    }
    await msg.react("✅");
    const stream = await yt.download(video.video_id, {
        type: "video+audio",
        quality: "best",
        format: "mp4",
    });
    if (!stream) {
        await msg.reply("Failed to download the video stream.");
        return;
    }
    const tempDir = "./.temp";
    await fs_1.default.promises.mkdir(tempDir, { recursive: true });
    const tempPath = path_1.default.join(tempDir, `${video.video_id}.mp4`);
    let writeStream = fs_1.default.createWriteStream(tempPath);
    for await (const chunk of Utils.streamToIterable(stream)) {
        writeStream.write(chunk);
    }
    await execPromise(`ffmpeg -y -i "${tempPath}" -c:v copy -c:a copy "${tempPath}.mp4"`);
    const audioBuffer = fs_1.default.readFileSync(tempPath + ".mp4");
    const media = new whatsapp_web_js_1.MessageMedia("audio/mpeg", audioBuffer.toString("base64"), `${video.title}.mp4`);
    await msg.reply(media, msg.from, {
        caption: `${video.title}`,
    });
    await fs_1.default.promises.unlink(tempPath);
    await fs_1.default.promises.unlink(tempPath + ".mp4");
}

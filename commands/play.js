"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = play;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const { Innertube, UniversalCache, Utils } = require("youtubei.js");
const util_1 = __importDefault(require("util"));
const execPromise = util_1.default.promisify(child_process_1.exec);
exports.info = {
    command: "play",
    description: "Play a YouTube music by searching for it.",
    usage: "play <query>",
    example: "play Never Gonna Give You Up",
    role: "user",
    cooldown: 5000,
};
async function play(msg) {
    const query = msg.body.replace(/^play\b\s*/i, "").trim();
    if (!query) {
        await msg.reply("Please provide a search query.");
        return;
    }
    const yt = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
    });
    const search = await yt.music.search(query, { type: "song" });
    const audio = search.contents[0].contents[0];
    if (!audio) {
        await msg.reply("Unable to find resources for the given query.");
        return;
    }
    if (audio.length && audio.length.seconds > 600) {
        await msg.reply("Sorry, only videos shorter than 10 minutes can be downloaded.");
        return;
    }
    await msg.react("✅");
    const stream = await yt.download(audio.id, {
        type: "video+audio",
        quality: "best",
        format: "mp4",
    });
    if (!stream) {
        await msg.reply("Failed to download the audio stream.");
        return;
    }
    const tempDir = "./.temp";
    await fs_1.default.mkdirSync(tempDir, { recursive: true });
    const tempPath = `${tempDir}/${audio.id}.mp4`;
    let writeStream = fs_1.default.createWriteStream(tempPath);
    for await (const chunk of Utils.streamToIterable(stream)) {
        writeStream.write(chunk);
    }
    await execPromise(`ffmpeg -y -i "${tempPath}" -vn -ar 44100 -ac 2 -b:a 192k "${tempPath}.mp3"`);
    const audioBuffer = fs_1.default.readFileSync(tempPath + ".mp3");
    const media = new whatsapp_web_js_1.MessageMedia("audio/mpeg", audioBuffer.toString("base64"), `${audio.title}.mp3`);
    await msg.reply(media, msg.from, {
        caption: audio.title,
        sendAudioAsVoice: true,
    });
    await fs_1.default.promises.unlink(tempPath);
    await fs_1.default.promises.unlink(tempPath + ".mp3");
}

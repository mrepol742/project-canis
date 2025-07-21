import { Message, MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import { exec } from "child_process";
// fallback import for compatibility
// youtubei.js currently does not support ESM directly
const { Innertube, UniversalCache, Utils } = require("youtubei.js");
import util from "util";

const execPromise = util.promisify(exec);

export const info = {
  command: "play",
  description: "Play a YouTube music by searching for it.",
  usage: "play <query>",
  example: "play Never Gonna Give You Up",
  role: "user",
  cooldown: 5000,
};

export default async function play(msg: Message) {
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

  await msg.reply(`Download in progress... "${audio.title}"`);

  const stream = await yt.download(audio.id, {
    type: "video+audio",
    quality: "best",
    format: "mp4",
  });

  const tempDir = "./.temp";
  await fs.mkdirSync(tempDir, { recursive: true });

  const tempPath = `${tempDir}/${audio.id}.mp4`;
  let writeStream = fs.createWriteStream(tempPath);

  for await (const chunk of Utils.streamToIterable(stream)) {
    writeStream.write(chunk);
  }

  await execPromise(
    `ffmpeg -y -i "${tempPath}" -vn -ar 44100 -ac 2 -b:a 192k "${tempPath}.mp3"`
  );

  const audioBuffer = fs.readFileSync(tempPath + ".mp3");
  const media = new MessageMedia(
    "audio/mpeg",
    audioBuffer.toString("base64"),
    `${audio.title}.mp3`
  );

  await msg.reply(media, msg.from, {
    caption: audio.title,
    sendAudioAsVoice: true,
  });

  await fs.promises.unlink(tempPath);
  await fs.promises.unlink(tempPath + ".mp3");
}

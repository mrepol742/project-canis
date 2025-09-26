import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import fs from "fs";
import path from "path";
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
    player_id: "0004de42",
  });
  const search = await yt.music.search(query, { type: "song" });

  const audio = search.contents[0].contents[0];
  if (!audio.id) {
    await msg.reply("Unable to find resources for the given query.");
    return;
  }

  // Only allow audios shorter than 10 minutes (600 seconds)
  if (audio.length && audio.length.seconds > 600) {
    await msg.reply(
      "Sorry, it seems like im not able to get any search results.",
    );
    return;
  }

  await msg.react("🔍");

  const stream = await yt.download(audio.id, {
    type: "video+audio",
    quality: "best",
    format: "mp4",
  });

  if (!stream) {
    await Promise.all([
      msg.reply("Failed to download the audio stream."),
      msg.react(""),
    ]);
    return;
  }

  await msg.react("⬇️");

  const tempDir = "./.temp";
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `${audio.id}.mp3`);
  let writeStream = fs.createWriteStream(tempPath);

  for await (const chunk of Utils.streamToIterable(stream)) {
    writeStream.write(chunk);
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end();
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  await execPromise(
    `ffmpeg -y -i "${tempPath}" -vn -ar 44100 -ac 2 -b:a 192k "${tempPath}.mp3"`,
  );

  const audioBuffer = fs.readFileSync(`${tempPath}.mp3`);
  const media = new MessageMedia(
    "audio/mpeg",
    audioBuffer.toString("base64"),
    `${audio.title}.mp3`,
  );

  await msg.reply(media, undefined, {
    caption: audio.title,
  });

  Promise.all([
    fs.promises.unlink(tempPath),
    fs.promises.unlink(`${tempPath}.mp3`),
  ]);
}

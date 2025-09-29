import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Innertube, UniversalCache, Utils } from "youtubei.js";
import util from "util";
import log from "../components/utils/log";

const execPromise = util.promisify(exec);

export const info = {
  command: "play",
  description: "Play a YouTube music by searching for it.",
  usage: "play <query>",
  example: "play Never Gonna Give You Up",
  role: "user",
  cooldown: 5000,
};

async function search(yt: Innertube, query: string) {
  log.info("Play", `Searching for ${query}`);
  const results = await yt.music.search(query, { type: "song" });
  const firstShelf = results.contents?.[0];
  const audio: any =
    firstShelf && "contents" in firstShelf
      ? firstShelf.contents?.[0]
      : undefined;

  if (audio?.id) return audio;

  const didYouMean: any = results.contents?.[0].contents?.[0];
  if (!didYouMean) return undefined;

  log.info("Play", `Did you mean ${didYouMean.corrected_query.text}`);
  return await search(yt, didYouMean.corrected_query.text);
}

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

  const audio: any = await search(yt, query);
  if (!audio) {
    await msg.reply(`No youtube music found for "${query}".`);
    return;
  }

  // Only allow audios shorter than 20 minutes (1200 seconds)
  if (audio.duration && audio.duration.seconds > 1200) {
    await msg.reply(
      "Opps, the music is quite long we can only process max of 20 minutes.",
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
      msg.reply("Failed to download the audio."),
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

  // simulates audio recording
  const chat = await msg.getChat();
  chat.sendStateRecording();

  await execPromise(
    `ffmpeg -y -i "${tempPath}" -vn -ar 44100 -ac 2 -b:a 192k "${tempPath}.mp3"`,
  );

  const media = MessageMedia.fromFilePath(`${tempPath}.mp3`);
  await msg.reply(media, undefined, {
    caption: audio.title,
  });

  Promise.all([
    fs.promises.unlink(tempPath),
    fs.promises.unlink(`${tempPath}.mp3`),
  ]);
}

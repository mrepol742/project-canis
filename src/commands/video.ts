import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import fs from "fs";
import path from "path";
import { Innertube, UniversalCache, Utils } from "youtubei.js";
import log from "../components/utils/log";

export const info = {
  command: "video",
  description: "Play a YouTube video by searching for it.",
  usage: "video <query>",
  example: "video Never Gonna Give You Up",
  role: "user",
  cooldown: 5000,
};

async function search(yt: Innertube, query: string) {
  log.info("Video", `Searching for ${query}`);
  const results = await yt.search(query, { type: "video" });
  const video: any = results.results?.[0];

  if (video?.video_id) return video;

  const didYouMean: any = results.results?.[0];
  if (!didYouMean) return undefined;

  log.info("Video", `Did you mean ${didYouMean.corrected_query.text}`);
  return await search(yt, didYouMean.corrected_query.text);
}

export default async function (msg: Message) {
  const query = msg.body.replace(/^video\b\s*/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
    player_id: "0004de42",
  });

  const video: any = await search(yt, query);
  if (!video) {
    await msg.reply(`No youtube video found for "${query}".`);
    return;
  }

  // Only allow audios shorter than 20 minutes (1200 seconds)
  if (video.duration && video.duration.seconds > 1200) {
    await msg.reply(
      "Opps, the video is quite long we can only process max of 20 minutes.",
    );
    return;
  }

  await msg.react("🔍");

  const stream = await yt.download(video.video_id, {
    type: "video+audio",
    quality: "best",
    format: "mp4",
  });

  if (!stream) {
    await Promise.all([
      msg.reply("Failed to download the video."),
      msg.react(""),
    ]);
    return;
  }

  await msg.react("⬇️");

  const tempDir = "./.temp";
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `${video.video_id}.mp4`);
  let writeStream = fs.createWriteStream(tempPath);

  for await (const chunk of Utils.streamToIterable(stream)) {
    writeStream.write(chunk);
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end();
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media, undefined, {
    caption: video.title.text,
  });

  fs.promises.unlink(tempPath);
}

import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import fs from "fs";
import path from "path";
// fallback import for compatibility
// youtubei.js currently does not support ESM directly
const { Innertube, UniversalCache, Utils } = require("youtubei.js");
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export const info = {
  command: "video",
  description: "Play a YouTube video by searching for it.",
  usage: "video <query>",
  example: "video Never Gonna Give You Up",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
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

  // Only allow videos shorter than 10 minutes (600 seconds)
  if (video.length && video.length.seconds > 600) {
    await msg.reply(
      "Sorry, only videos shorter than 10 minutes can be downloaded.",
    );
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
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `${video.video_id}.mp4`);
  let writeStream = fs.createWriteStream(tempPath);

  for await (const chunk of Utils.streamToIterable(stream)) {
    writeStream.write(chunk);
  }

  await execPromise(
    `ffmpeg -y -i "${tempPath}" -c:v copy -c:a copy "${tempPath}.mp4"`,
  );

  const audioBuffer = fs.readFileSync(tempPath + ".mp4");
  const media = new MessageMedia(
    "audio/mpeg",
    audioBuffer.toString("base64"),
    `${video.title}.mp4`,
  );

  await msg.reply(media, msg.from, {
    caption: `${video.title}`,
  });
  await fs.promises.unlink(tempPath);
  await fs.promises.unlink(tempPath + ".mp4");
}

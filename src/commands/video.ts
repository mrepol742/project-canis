import { Message, MessageMedia } from "whatsapp-web.js";
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

  const title = video.title.toString();
  await msg.reply(`Download in progress... "${title}"`);

  const stream = await yt.download(video.video_id, {
    type: "video+audio",
    quality: "best",
    format: "mp4",
  });

  const tempDir = "./.temp";
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `${video.video_id}.mp4`);
  let writeStream = fs.createWriteStream(tempPath);

  for await (const chunk of Utils.streamToIterable(stream)) {
    writeStream.write(chunk);
  }

  await execPromise(
    `ffmpeg -y -i "${tempPath}" -c:v copy -c:a copy "${tempPath}.mp4"`
  );

  const audioBuffer = fs.readFileSync(tempPath + ".mp4");
  const media = new MessageMedia(
    "audio/mpeg",
    audioBuffer.toString("base64"),
    `${title}.mp4`
  );

  await msg.reply(media, msg.from, {
    caption: `${title}`,
  });
  await fs.promises.unlink(tempPath);
  await fs.promises.unlink(tempPath + ".mp4");
}

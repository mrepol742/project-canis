import { Message, MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import innertube from "../components/innertube";
import ytdl from "ytdl-core";
import { client } from "../components/client";

export const command = "play";
export const role = "admin";

// Type guard
function isVideoNode(node: any): node is {
  type: string;
  video_id: string;
  title: { toString(): string };
  length_text?: { toString(): string };
} {
  return node?.type === "Video" && typeof node.video_id === "string";
}

export default async function play(msg: Message) {
  const query = msg.body.replace(/^play\b\s*/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const yt = await innertube();
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

  const filePath = path.resolve(__dirname, `../../.temp/audio-${videoId}.webm`);
  const audioStream = ytdl(videoUrl, {
    filter: "audioonly",
    quality: "highestaudio",
  });
  const writeStream = fs.createWriteStream(filePath);
  audioStream.pipe(writeStream);

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  const audioBuffer = fs.readFileSync(filePath);
  const media = new MessageMedia(
    "audio/webm",
    audioBuffer.toString("base64"),
    `audio-${videoId}.webm`
  );
  await client.sendMessage(msg.from, media, {
    caption: `🎶 *${title}*`,
  });

  fs.unlinkSync(filePath);
}

import { Message } from "../types/message";
import video from "./video";

export const info = {
  command: "ytdl",
  description: "Download youtube video from the given url.",
  usage: "ytdl <url>",
  example: "ytdl https://www.youtube.com/watch?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^ytdl\b\s*/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a youtube url.");
    return;
  }

  const youtubeUrlRegex =
    /^(https?:\/\/)?([a-z0-9-]+\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})([^\s#]*)?$/i;
  if (!youtubeUrlRegex.test(query)) {
    await msg.reply("That doesn't look like a valid youtube link.");
    return;
  }

  msg.body = `video ${query}`;
  video(msg);
}

import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../types/message"
import { getFbVideoInfo } from "fb-downloader-scrapper";
import crypto from "crypto";
import log from "../components/utils/log";
import axios from "../components/axios";
import fs from "fs";
import he from "he";
import { fileExists } from "../components/utils/file";

export const info = {
  command: "fbdl",
  description: "Download facebook video from the provided url.",
  usage: "fbdl <url>",
  example: "fbdl https://www.facebook.com/watch?v=1234567890",
  role: "user",
  cooldown: 5000,
};

function md5FromUrl(url: string) {
  return crypto.createHash("md5").update(url).digest("hex");
}

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^fbdl\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a facebook url.");
    return;
  }

  const facebookUrlRegex =
    /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+$/i;
  if (!facebookUrlRegex.test(query)) {
    await msg.reply("Please provide a valid Facebook link.");
    return;
  }

  const [result] = await Promise.all([getFbVideoInfo(query), msg.react("🔍")]);

  if (!result.url) {
    await Promise.all([
      msg.reply("No video found at the provided URL."),
      msg.react(""),
    ]);
    return;
  }

  const tempDir = "./.temp";
  fs.mkdirSync(tempDir, { recursive: true });
  const tempPath = `${tempDir}/${md5FromUrl(result.url)}.mp4`;

  if (await fileExists(tempPath)) {
    const media = MessageMedia.fromFilePath(tempPath);
    await Promise.all([
      msg.reply(media, undefined, {
        caption: he.decode(result.title),
      }),
      msg.react(""),
    ]);
    return;
  }

  await msg.react("⬇️");

  const response = await axios.get(result.hd || result.sd, {
    responseType: "arraybuffer",
  });
  fs.writeFileSync(tempPath, response.data);

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media, undefined, {
    caption: he.decode(result.title),
  });
}

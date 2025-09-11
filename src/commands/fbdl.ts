import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import { getFbVideoInfo } from "fb-downloader-scrapper";
import log from "../components/utils/log";
import axios from "axios";
import fs from "fs";

export const info = {
  command: "fbdl",
  description: "Download Facebook videos.",
  usage: "fbdl <facebook_url>",
  example: "fbdl https://www.facebook.com/watch?v=1234567890",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
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

  const result = await getFbVideoInfo(query);
  if (!result.url)
    return await msg.reply("No video found at the provided URL.");

  const response = await axios.get(result.hd || result.sd, {
    responseType: "arraybuffer",
  });

  const tempDir = "./.temp";
  fs.mkdirSync(tempDir, { recursive: true });

  const tempPath = `${tempDir}/fbdl_${Date.now()}.mp4`;
  fs.writeFileSync(tempPath, response.data);

  const audioBuffer = fs.readFileSync(tempPath);
  const media = new MessageMedia(
    "audio/mpeg",
    audioBuffer.toString("base64"),
    `${result.title}.mp4`,
  );

  await msg.reply(media, msg.from);
  await fs.promises.unlink(tempPath);
}

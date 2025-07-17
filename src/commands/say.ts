import { Message, MessageMedia } from "whatsapp-web.js";
import log from "npmlog";
import * as GoogleTTS from "google-tts-api";
import fs from "fs";
import axios from "axios";
import { client } from "../index";

export const command = "say";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^say\s+/i, "").trim();
  if (!query) {
    await msg.reply("Please provide something to say.");
    return;
  }

  const url = GoogleTTS.getAudioUrl(query, {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });

  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const tempDir = "./.temp";
  const tempPath = `${tempDir}/${Date.now()}.mp3`;

  // Ensure the temp directory exists
  await fs.promises.mkdir(tempDir, { recursive: true });

  await fs.promises.writeFile(tempPath, buffer);
  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media);
  await fs.promises.unlink(tempPath);
}

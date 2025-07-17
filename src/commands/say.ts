import { Message, MessageMedia } from "whatsapp-web.js";
import log from "npmlog";
import * as GoogleTTS from "google-tts-api";
import fs from "fs";
import { client } from "../index";

export const command = "say";
export const role = "user";

export default async function (msg: Message) {
  try {
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

    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const tempDir = "./.temp";
    const tempPath = `${tempDir}/${Date.now()}.mp3`;

    // Ensure the temp directory exists
    await fs.promises.mkdir(tempDir, { recursive: true });

    await fs.promises.writeFile(tempPath, buffer); 
    const media = MessageMedia.fromFilePath(tempPath);
    await client.sendMessage(msg.from, media, { sendAudioAsVoice: true });
    await fs.promises.unlink(tempPath);

  } catch (error) {
    log.error("Command", "Error occurred while processing the request:", error);
    await msg.reply("An error occurred while processing your request.");
  }
}

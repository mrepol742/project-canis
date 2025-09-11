import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message"
import log from "../components/utils/log";
import * as GoogleTTS from "google-tts-api";
import fs from "fs";
import axios from "axios";
import { client } from "../components/client";

export const info = {
  command: "say",
  description: "Convert text to speech and send it as an audio message.",
  usage: "say <text>",
  example: "say Hello, how are you?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^say\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide something to say.");
    return;
  }

  const url = GoogleTTS.getAudioUrl(query.substring(0, 150), {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });

  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const tempDir = "./.temp";
  const filename = `say_${Date.now()}.mp3`;
  const tempPath = `${tempDir}/say_${Date.now()}.mp3`;

  // Ensure the temp directory exists
  await fs.promises.mkdir(tempDir, { recursive: true });
  await fs.promises.writeFile(tempPath, buffer);

  const audioBuffer = fs.readFileSync(tempPath);
  const media = new MessageMedia(
    "audio/mpeg",
    audioBuffer.toString("base64"),
    `${filename}.mp3`
  );
  await msg.reply(media, msg.from, {
    sendAudioAsVoice: true,
  });
  await fs.promises.unlink(tempPath);
}

import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../types/message";
import * as GoogleTTS from "google-tts-api";
import fs from "fs";
import axios from "../components/axios";

const PROJECT_CANIS_ALIS: string = process.env.PROJECT_CANIS_ALIAS || "Canis";

export const info = {
  command: "say",
  description: "Convert text to speech and send it as an audio message.",
  usage: "say <text>",
  example: "say Hello, how are you?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^say\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide something to say.");
    return;
  }

  const url: {
    shortText: string;
    url: string;
  }[] = GoogleTTS.getAllAudioUrls(query.slice(0, 2000), {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });

  if (!url || url.length === 0) {
    throw Error("Unable to generate audio");
  }

  for (let i = 0; i < url.length; i++) {
    const response = await axios.get(url[i].url, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);
    const media = new MessageMedia(
      "audio/mpeg",
      buffer.toString("base64"),
      `${PROJECT_CANIS_ALIS}.mp3`,
    );
    await msg.reply(media, undefined, {
      sendAudioAsVoice: true,
    });
  }
}

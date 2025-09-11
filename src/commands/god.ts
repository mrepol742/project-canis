import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message"
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const info = {
  command: "god",
  description: "Generate a phone image with the provided text.",
  usage: "god <text>",
  example: "god how to sleep 6 hours in 2 hours",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^god\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  const response = await axios.get(
    `https://api.popcat.xyz/unforgivable?text=${encodeURIComponent(query)}`,
    {
      responseType: "arraybuffer",
    }
  );

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = `${tempDir}/${Date.now()}.png`;
  await fs.writeFile(tempPath, response.data);

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media);
  await fs.unlink(tempPath);
}

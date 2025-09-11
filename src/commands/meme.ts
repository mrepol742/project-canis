import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message"
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";

export const info = {
  command: "meme",
  description: "Fetch a random meme image.",
  usage: "meme",
  example: "meme",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^meme$/i.test(msg.body)) return;

  const result = await axios.get("https://api.popcat.xyz/meme");

  const response = await axios.get(result.data.content.image, {
    responseType: "arraybuffer",
  });

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = `${tempDir}/meme_${Date.now()}.png`;
  await fs.writeFile(tempPath, response.data);

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media);
  await fs.unlink(tempPath);
}

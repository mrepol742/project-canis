import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";
import fs from "fs/promises";
import { client } from "../index";

export const command = "poli";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^poli\s+/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a prompt.");
    return;
  }

  const response = await axios.get(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`,
    { responseType: "arraybuffer" }
  );

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = `${tempDir}/${Date.now()}.png`;
  await fs.writeFile(tempPath, response.data);

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media);
  await fs.unlink(tempPath);
}

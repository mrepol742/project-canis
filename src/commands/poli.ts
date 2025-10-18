import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../types/message"
import axios from "../components/axios";
import fs from "fs/promises";

export const info = {
  command: "poli",
  description: "Generate an image using Pollinations AI.",
  usage: "poli <prompt>",
  example: "poli a beautiful sunset over the mountains",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^poli\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a prompt.");
    return;
  }

  const response = await axios.get(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`,
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

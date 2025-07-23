import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";

export const info = {
  command: "alert",
  description: "Generate an alert image with the provided text.",
  usage: "alert <text>",
  example: "alert This is an important message!",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^alert\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  const response = await axios.get(
    `https://api.popcat.xyz/alert?text=${encodeURIComponent(query)}`,
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

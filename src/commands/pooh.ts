import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const info = {
  command: "pooh",
  description: "Generate a Pooh image with two texts.",
  usage: "pooh <text1> | <text2>",
  example: "pooh I love you | I love you too",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const args = msg.body
    .replace(/^pooh\b\s*/i, "")
    .trim()
    .split("|")
    .map((s) => s.trim());
  if (args.length < 2 || !args[0] || !args[1]) {
    await msg.reply(
      "Please provide two texts separated by '|'. Example: pooh text1 | text2",
    );
    return;
  }
  const [text1, text2] = args;

  const response = await axios.get(
    `https://api.popcat.xyz/pooh?text1=${encodeURIComponent(
      text1,
    )}&text2=${encodeURIComponent(text2)}`,
    {
      responseType: "arraybuffer",
    },
  );

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = `${tempDir}/${Date.now()}.png`;
  await fs.writeFile(tempPath, response.data);

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media);
  await fs.unlink(tempPath);
}

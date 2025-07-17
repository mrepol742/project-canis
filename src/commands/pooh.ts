import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";
import fs from "fs/promises";
import { client } from "../components/client";

export const command = "pooh";
export const role = "user";
export default async function (msg: Message) {
  const args = msg.body
    .replace(/^pooh\b\s*/i, "")
    .trim()
    .split("|")
    .map((s) => s.trim());
  if (args.length < 2 || !args[0] || !args[1]) {
    await msg.reply(
      "Please provide two texts separated by '|'. Example: pooh text1 | text2"
    );
    return;
  }
  const [text1, text2] = args;

  await axios
    .get(
      `https://api.popcat.xyz/pooh?text1=${encodeURIComponent(
        text1
      )}&text2=${encodeURIComponent(text2)}`,
      {
        responseType: "arraybuffer",
      }
    )
    .then(async (response) => {
      const tempDir = "./.temp";
      await fs.mkdir(tempDir, { recursive: true });

      const tempPath = `${tempDir}/${Date.now()}.png`;
      await fs.writeFile(tempPath, response.data);

      const media = MessageMedia.fromFilePath(tempPath);
      await msg.reply(media);
      await fs.unlink(tempPath);
    })
    .catch(async (error) => {
      log.error("pooh", `Error fetching image: ${error.message}`);
      await msg.reply("Error fetching image. Please try again later.");
    });
}

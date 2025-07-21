import { Message, MessageMedia } from "whatsapp-web.js";
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

  await axios
    .get("https://api.popcat.xyz/meme")
    .then(async (response) => {
      await axios
        .get(response.data.content.image, {
          responseType: "arraybuffer",
        })
        .then(async (response) => {
          const tempDir = "./.temp";
          await fs.mkdir(tempDir, { recursive: true });

          const tempPath = `${tempDir}/meme_${Date.now()}.png`;
          await fs.writeFile(tempPath, response.data);

          const media = MessageMedia.fromFilePath(tempPath);
          await msg.reply(media);
          await fs.unlink(tempPath);
        })
        .catch(async (error) => {
          log.error("meme", `Error fetching image: ${error.message}`);
          await msg.reply("Error fetching image. Please try again later.");
        });
    })
    .catch(async (error) => {
      log.error("meme", `Error fetching data: ${error.message}`);
      await msg.reply("Error fetching data. Please try again later.");
    });
}

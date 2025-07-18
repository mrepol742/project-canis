import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/log";
import fs from "fs/promises";

export const command = "alert";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^alert\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  await axios
    .get(`https://api.popcat.xyz/alert?text=${encodeURIComponent(query)}`, {
      responseType: "arraybuffer",
    })
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
      log.error("alert", `Error fetching image: ${error.message}`);
      await msg.reply("Error fetching image. Please try again later.");
    });
}

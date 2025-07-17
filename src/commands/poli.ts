import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";
import fs from "fs/promises";
import { client } from "../components/client";

export const command = "poli";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^poli\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a prompt.");
    return;
  }

  await axios
    .get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
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
      log.error("poli", `Error fetching image: ${error.message}`);
      await msg.reply("Error fetching image. Please try again later.");
    });
}

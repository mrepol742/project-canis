import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const command = "qrcode";
export const role = "user";

export const info = {
  command: "qrcode",
  description: "Generate a QR code from the provided text.",
  usage: "qrcode <text>",
  example: "qrcode https://example.com",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^qrcode\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }
    
  await axios
    .get(
      `https://api.qrserver.com/v1/create-qr-code/?150x150&data=${encodeURIComponent(query)}`,
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
      log.error("qrcode", `Error fetching image: ${error.message}`);
      await msg.reply("Error fetching image. Please try again later.");
    });
}

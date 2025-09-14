import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message"
import axios from "../components/axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const info = {
  command: "hwaifu",
  description: "Generate a waifu image with optional categories.",
  usage: "hwaifu [neko|trap|blowjob]",
  example: "hwaifu neko",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^hwaifu\b\s*/i, "").trim();
  if (query.length !== 0) {
    if (!/^(neko|trap|blowjob)$/i.test(query)) {
      await msg.reply(
        "Invalid argument. Please use one of the following:\n\nneko, trap, blowjob"
      );
      return;
    }
  }

  const result = await axios.get(
    `https://api.waifu.pics/nsfw/${query.length > 0 ? query : "waifu"}`
  );

  const response = await axios.get(result.data.url, {
    responseType: "arraybuffer",
  });

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = `${tempDir}/${Date.now()}.png`;
  await fs.writeFile(tempPath, response.data);

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media);
  await fs.unlink(tempPath);
}

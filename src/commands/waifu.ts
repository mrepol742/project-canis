import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message"
import axios from "../components/axios";
import log from "../components/utils/log";
import fs from "fs/promises";

export const info = {
  command: "waifu",
  description: "Get a random waifu image or a specific type of waifu.",
  usage: "waifu [type]",
  example: "waifu neko",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^waifu\b\s*/i, "").trim();
  if (query.length !== 0) {
    if (
      !/^(neko|shinobu|megumin|bully|cuddle|cry|hug|awoo|kiss|lick|pat|smug|bonk|yeet|blush|smile|wave|highfive|handhold|nom|bite|glomp|slap|kill|kick|happy|wink|poke|dance|cringe)$/i.test(
        query
      )
    ) {
      await msg.reply(
        "Invalid argument. Please use one of the following:\n\nneko, shinobu, megumin, bully, cuddle, cry, hug, awoo, kiss, lick, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe"
      );
      return;
    }
  }

  const result = await axios.get(
    `https://api.waifu.pics/sfw/${query.length > 0 ? query : "waifu"}`
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

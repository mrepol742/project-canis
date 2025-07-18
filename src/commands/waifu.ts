import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const command = "waifu";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^waifu\b\s*/i, "").trim();
  if (query.length !== 0) {
    if (!/^(neko|shinobu|megumin|bully|cuddle|cry|hug|awoo|kiss|lick|pat|smug|bonk|yeet|blush|smile|wave|highfive|handhold|nom|bite|glomp|slap|kill|kick|happy|wink|poke|dance|cringe)$/i.test(query)) {
      await msg.reply(
        "Invalid argument. Please use one of the following:\n\nneko, shinobu, megumin, bully, cuddle, cry, hug, awoo, kiss, lick, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe"
      );
      return;
    }
  }

  await axios
    .get(`https://api.waifu.pics/sfw/${query.length > 0 ? query : "waifu"}`)
    .then(async (response) => {
      await axios
        .get(response.data.url, {
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
          log.error("waifu", `Error fetching image: ${error.message}`);
          await msg.reply("Error fetching image. Please try again later.");
        });
    })
    .catch(async (error) => {
      log.error("waifu", `Error fetching data: ${error.message}`);
      await msg.reply(
        `Error fetching data for "${query}". Please try again later.`
      );
    });
}

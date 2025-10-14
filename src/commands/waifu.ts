import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import axios from "../components/axios";
import fs from "fs/promises";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

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
        query,
      )
    ) {
      await msg.reply(
        "Invalid argument. Please use one of the following:\n\nneko, shinobu, megumin, bully, cuddle, cry, hug, awoo, kiss, lick, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe",
      );
      return;
    }
  }

  const result = await axios.get(
    `https://api.waifu.pics/sfw/${query.length > 0 ? query : "waifu"}`,
  );

  const response = await axios.get(result.data.url, {
    responseType: "arraybuffer",
  });

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = `${tempDir}/${Date.now()}.gif`;
  await fs.writeFile(tempPath, response.data);

  await execPromise(
    `ffmpeg -y -i "${tempPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${tempPath.replace(".gif", ".mp4")}"`,
  );

  const media = MessageMedia.fromFilePath(tempPath.replace(".gif", ".mp4"));
  await msg.reply(media, undefined, {
    sendVideoAsGif: true,
  });
  await fs.unlink(tempPath);
  await fs.unlink(tempPath.replace(".gif", ".mp4"));
}

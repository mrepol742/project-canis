import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";
import fs from "fs/promises";
import { client } from "../index";

export const command = "hwaifu";
export const role = "admin";

export default async function (msg: Message) {
  const query = msg.body.replace(/^hwaifu\b\s*/i, "").trim();
  if (query.length !== 0) {
    if (
      !/^(neko|trap|blowjob)$/i.test(
        query
      )
    ) {
      await msg.reply(
        "Invalid argument. Please use one of the following:\n\nneko, trap, blowjob"
      );
      return;
    }
  }

  await axios
    .get(`https://api.waifu.pics/nsfw/${query.length > 0 ? query : "waifu"}`)
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
          log.error("hwaifu", `Error fetching image: ${error.message}`);
          await msg.reply("Error fetching image. Please try again later.");
        });
    })
    .catch(async (error) => {
      log.error("hwaifu", `Error fetching data: ${error.message}`);
      await msg.reply(
        `Error fetching data for "${query}". Please try again later.`
      );
    });
}

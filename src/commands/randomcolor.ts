import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const info = {
  command: "randomcolor",
  description: "Generate a random color with its name and hex code.",
  usage: "randomcolor",
  example: "randomcolor",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  await axios
    .get(`https://api.popcat.xyz/randomcolor`)
    .then(async (response) => {
      const hex = response.data.hex;
      const name = response.data.name;
      const image = response.data.image;

      const color = `
     \`${name}\`
     ${hex}
     `;
      await msg.reply(color);
    })
    .catch(async (error) => {
      log.error("randomcolor", `Error fetching data: ${error.message}`);
      await msg.reply(`Error fetching data . Please try again later.`);
    });
}

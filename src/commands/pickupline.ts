import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";
import Font from "../components/utils/font";

export const command = "pickupline";
export const role = "user";

export const info = {
  command: "pickupline",
  description: "Fetch a random pick-up line.",
  usage: "pickupline",
  example: "pickupline",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  await axios
    .get(`https://api.popcat.xyz/pickuplines`)
    .then(async (response) => {
      await msg.reply(Font(response.data.pickupline));
    })
    .catch(async (error) => {
      log.error("pickupline", `Error fetching data: ${error.message}`);
      await msg.reply(`Error fetching data. Please try again later.`);
    });
}

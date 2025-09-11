import { Message } from "../../types/message"
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";
import Font from "../components/utils/font";

export const info = {
  command: "pickupline",
  description: "Fetch a random pick-up line.",
  usage: "pickupline",
  example: "pickupline",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^pickupline$/i.test(msg.body)) return;

  const response = await axios.get(`https://api.popcat.xyz/pickuplines`);

  await msg.reply(response.data.pickupline);
}

import { Message } from "../types/message"
import axios from "../components/axios";

export const info = {
  command: "pickupline",
  description: "Fetch a random pick-up line.",
  usage: "pickupline",
  example: "pickupline",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const response = await axios.get(`https://api.popcat.xyz/pickuplines`);
  await msg.reply(response.data.pickupline);
}

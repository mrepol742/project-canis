import { Message } from "whatsapp-web.js";
import { joke } from "../components/utils/data";

export const info = {
  command: "joke",
  description: "Get a random joke.",
  usage: "joke",
  example: "joke",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^joke\b/i.test(msg.body)) return;

  const response = joke[Math.floor(Math.random() * joke.length)];
  if (response.length === 0) return await msg.reply("I don't have any jokes right now...");
  await msg.reply(response);
}

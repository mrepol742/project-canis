import { Message } from "whatsapp-web.js";
import { dyk } from "../components/utils/data";

export const info = {
  command: "dyk",
  description: "Did you know? Get a random trivia.",
  usage: "dyk",
  example: "dyk",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^dyk\b/i.test(msg.body)) return;

  const response = dyk[Math.floor(Math.random() * dyk.length)];
  if (response.length === 0) return await msg.reply("I dont know...");
  await msg.reply(response);
}

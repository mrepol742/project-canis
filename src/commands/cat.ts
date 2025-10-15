import { Message } from "../types/message"
import { cat } from "../components/utils/data";

export const info = {
  command: "cat",
  description: "Get a random cat trivia.",
  usage: "cat",
  example: "cat",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!/^cat$/i.test(msg.body)) return;

  await msg.reply(cat[Math.floor(Math.random() * cat.length)]);
}

import { Message } from "../../types/message"
import { cat } from "../components/utils/data";

export const info = {
  command: "cat",
  description: "Get a random cat trivia.",
  usage: "cat",
  example: "cat",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^cat$/i.test(msg.body)) return;

  const response = cat[Math.floor(Math.random() * cat.length)];
  if (response.length === 0) return await msg.reply("Cat is silent...");
  await msg.reply(response);
}

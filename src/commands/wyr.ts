import { Message } from "../../types/message"
import { wyr } from "../components/utils/data";

export const info = {
  command: "wyr",
  description: "Would you rather? Get a random 'Would You Rather' question.",
  usage: "wyr",
  example: "wyr",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^wyr$/i.test(msg.body)) return;

  const response = wyr[Math.floor(Math.random() * wyr.length)];
  if (response.length === 0)
    return await msg.reply("I don't have any jokes right now...");
  const text = `
  \`Would you rather?\`

  ${response.ops1}
  or
  ${response.ops2}
  `;
  await msg.reply(text);
}

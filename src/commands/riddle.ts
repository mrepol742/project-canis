import { Message } from "../types/message";
import { riddles } from "../components/utils/data";
import redis from "../components/redis";

export const info = {
  command: "riddle",
  description: "Get a random riddle that will shake your head.",
  usage: "riddle",
  example: "riddle",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const id = Math.floor(Math.random() * riddles.length);
  const response = riddles[id];

  let text = `
    \`${response.question}\`
  `;

  const messageReturn = await msg.reply(text);
  await redis.set(
    `riddle:${messageReturn.id.id}`,
    JSON.stringify({ riddle_id: id.toString() }),
    {
      expiration: {
        type: "EX",
        value: 3600,
      },
    },
  );
}

import { Message } from "../types/message";
import { riddles } from "../components/utils/data";
import log from "../components/utils/log";
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
  if (!/^riddle/i.test(msg.body)) return;

  const id = Math.floor(Math.random() * riddles.length);
  const response = riddles[id];

  let text = `
    \`${response.question}\`
  `;

  const messageReturn = await msg.reply(text);
  redis.set(
    `riddle:${messageReturn.id.id}`,
    JSON.stringify({ riddle_id: id.toString() }),
    {
      EX: 3600, // 1 hour
    },
  );
  log.info("riddle", `Riddle sent: ${response.question}`);
}

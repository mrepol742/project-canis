import { Message } from "../types/message"
import redis from "../components/redis";

export const info = {
  command: "redis",
  description: "Access the redis-cli.",
  usage: "redis <command> [args]",
  example: "redis get block:12345",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!/^redis/i.test(msg.body)) return;

  const [, ...args] = msg.body.trim().split(/\s+/);
  if (args.length === 0) {
    await msg.reply("Missing command and/or arguments.");
    return;
  }

  const [cmd, ...params] = args;
  const result = await (redis as any)[cmd.toLowerCase()](...params);

  let text: string;
  if (result === null) text = "(nil)";
  else if (Array.isArray(result)) text = result.join("\n");
  else text = result.toString();

  const constructReply = `
    \`Redis Result\`

    \`\`\`
    ${text}
    \`\`\`
  `;

  await msg.reply(constructReply);
}

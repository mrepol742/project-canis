import { Message } from "../types/message";

export const info = {
  command: "echo",
  description: "Echo the user's message.",
  usage: "echo <count> <time> <message>",
  example: "echo 5 10s Hello, world!",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const args = msg.body.trim().split(" ").slice(1);
  if (args.length < 3) {
    await msg.reply(
      "Usage: echo <count> <time> <message>\nExample: echo 5 10s Hello, world!",
    );
    return;
  }

  const count = parseInt(args[0], 10);
  const timeStr = args[1];
  const message = args.slice(2).join(" ");

  if (isNaN(count) || count <= 0) {
    await msg.reply("Please provide a valid positive number for count.");
    return;
  }

  const timeMatch = timeStr.match(/^(\d+)(s|m|h)$/);
  if (!timeMatch) {
    await msg.reply("Please provide a valid time format (e.g., 10s, 5m, 1h).");
    return;
  }

  const timeValue = parseInt(timeMatch[1], 10);
  const timeUnit = timeMatch[2];
  let delay = 0;

  switch (timeUnit) {
    case "s":
      delay = timeValue * 1000;
      break;
    case "m":
      delay = timeValue * 60 * 1000;
      break;
    case "h":
      delay = timeValue * 60 * 60 * 1000;
      break;
  }

  for (let i = 0; i < count; i++) {
    setTimeout(async () => {
      await msg.reply(message);
    }, delay * i);
  }
}

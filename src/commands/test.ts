import { Message } from "../types/message";

export const info = {
  command: "test",
  description:
    "A simple test command with optional error to test error handling.",
  usage: "test [--error]",
  example: "test --error",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const match = /^test(?:\s+--error)?$/i.exec(msg.body.trim());
  if (!match) return;

  const error = msg.body.includes("--error");

  if (error) throw Error("This is a test error");

  const testMessage = `
    \`Hello World\`

    If you can read this it means the bot client is working.
  `;

  await msg.reply(testMessage);
}

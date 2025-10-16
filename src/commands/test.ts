import { Message } from "../types/message"

export const info = {
  command: "test",
  description: "A simple test command.",
  usage: "test",
  example: "test",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const testMessage = `
    \`Hello World\`

    If you can read this it means the bot client is working.
  `;

  await msg.reply(testMessage);
}

import { Message } from "../../types/message";
import log from "../components/utils/log";

export const info = {
  command: "test",
  description: "A simple test command.",
  usage: "test",
  example: "test",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^test$/.test(msg.body)) return;

  const testMessage = `
    \`Hello World\`

    If you can read this it means the bot client is working.
  `;

  await msg.reply(testMessage);
}

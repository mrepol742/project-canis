import { Message } from "../types/message"
import log from "../components/utils/log";

export const info = {
  command: "lid",
  description: "Get your LID",
  usage: "lid",
  example: "lid",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  let message: Message = msg;
  if (msg.hasQuotedMsg) message = await msg.getQuotedMessage();

  const lid = message.author
    ? message.author.split("@")[0]
    : message.from.split("@")[0];

  await msg.reply(`
    \`Your LID\`

    ${lid}
  `);
}

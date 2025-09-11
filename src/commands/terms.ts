import { Message } from "../../types/message"
import log from "../components/utils/log";

export const info = {
  command: "terms",
  description: "Display the terms of service of the bot.",
  usage: "terms",
  example: "terms",
  role: "legal",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^terms$/i.test(msg.body)) return;

  const text = `
  \`Terms of Service\`
    By using this bot, you agree to the following terms:

    - You will not use the bot for any illegal activities.
    - You will not spam or abuse the bot.
    - You will respect the privacy of other users.
    - The bot owner reserves the right to block users who violate these terms.
    `;

  await msg.reply(text);
}

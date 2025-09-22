import { Message } from "../../types/message";
import log from "../components/utils/log";

export const info = {
  command: "legal",
  description: "List down legal commands.",
  usage: "legal",
  example: "legal",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^legal$/i.test(msg.body)) return;

  const text = `
    \`Legal Commands\`

    \`terms\`
    Display the terms of service of the bot.

    \`privacy\`
    Display the privacy policy of the bot.

    \`dcma\`
    Display the DCMA policy of the bot.

    \`license\`
    Display the License of the bot.

    \`contact\`
    mrepol742@gmail.com
    `;

  await msg.reply(text);
}

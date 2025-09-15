import { Message } from "../../types/message";

export const info = {
  command: "fork",
  description: "Fork this bot on GitHub.",
  usage: "fork",
  example: "fork",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^fork$/i.test(msg.body)) return;

  const text = `
  \`Canis for WhatsApp\`
    https://github.com/mrepol742/project-canis

  \`Canis for Telegram\`
    https://github.com/mrepol742/project-canis-ts

    This bot is not affiliated, endorsed, partner, or connected to Meta.
    Use it at your own RISK.

    Type \`Legal\` for more information.
    `;

  await msg.reply(text);
}

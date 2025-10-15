import { Message } from "../types/message"

export const info = {
  command: "fork",
  description: "Fork this bot on GitHub.",
  usage: "fork",
  example: "fork",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!/^fork$/i.test(msg.body)) return;

  const text = `
    \`Open Source\`
    Don't forget to leave a star and fork it on Github.

    \`Canis for WhatsApp\`
    https://github.com/mrepol742/project-canis

    \`Canis for Telegram\`
    https://github.com/mrepol742/project-canis-tg

    This bot is not affiliated, endorsed, partner, or connected to Meta.
    Use it at your own RISK.

    Type \`Legal\` for more information.
  `;
  await msg.reply(text);
}

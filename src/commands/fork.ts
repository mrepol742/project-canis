import { Message } from "../types/message";

export const info = {
  command: "fork",
  description: "Display the bot github repository.",
  usage: "fork",
  example: "fork",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const text = `
    \`Open Source\`
    Don't forget to leave a star and fork it on Github.

    This bot is not affiliated, endorsed, partner, or connected to Meta.
    Use it at your own RISK.

    Type \`Legal\` for more information.

    https://www.melvinjonesrepol.com/projects/project-canis
  `;
  await msg.reply(text);
}

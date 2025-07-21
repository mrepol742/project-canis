import { Message } from "whatsapp-web.js";

export const info = {
  command: "fork",
  description: "Fork this bot on GitHub.",
  usage: "fork",
  example: "fork",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^fork\b/i.test(msg.body)) return;

  await msg.reply(
    "Fork this bot at https://github.com/mrepol742/project-canis or contribute to the project by submitting issues or pull requests."
  );
}

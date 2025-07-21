import { Message } from "whatsapp-web.js";
import { quiz } from "../components/utils/data";

export const info = {
  command: "quiz",
  description: "Get a random quiz question.",
  usage: "quiz",
  example: "quiz",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^quiz\b/i.test(msg.body)) return;

  const response = quiz[Math.floor(Math.random() * quiz.length)];
  if (response.length === 0)
    return await msg.reply("I don't have any quiz questions right now...");
  const text = `
  ${response.question}

    *Options:*
    ${response.choices
      .map((choice: string, index: number) => `${index + 1}. ${choice}`)
      .join("\n    ")}
  `;
  await msg.reply(text);
}

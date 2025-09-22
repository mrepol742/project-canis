import { Message } from "../../types/message"
import { quiz } from "../components/utils/data";
import { newQuizAttempt } from "../components/services/quiz";
import log from "../components/utils/log";

export const info = {
  command: "quiz",
  description: "Get a random quiz question.",
  usage: "quiz",
  example: "quiz",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^quiz$/i.test(msg.body)) return;

  const id = Math.floor(Math.random() * quiz.length);
  const response = quiz[id];

  if (response.length === 0)
    return await msg.reply("I don't have any quiz questions right now...");

  let text = `
    \`${response.question}\`
  `;

  if (response.choices && response.choices.length > 0) {
    text += `
    *Options:*
    ${response.choices
      .map((choice: string, index: number) => `${index + 1}. ${choice}`)
      .join("\n    ")}
    `;
  }

  const messageReturn = await msg.reply(text);
  await Promise.all([
    newQuizAttempt(messageReturn, id.toString()),
    log.info("quiz", `Quiz question sent: ${response.question}`),
  ]);
}

import { Message } from "whatsapp-web.js";
import { getQuizAttempts, setQuizAttemptAnswered } from "../services/quiz";
import { quiz } from "../utils/data";

const done = [
  "Correct! 🎉",
  "Well done! 👍",
  "Nice job! ✅",
  "You got it! 🥳",
  "That's right! 👏",
  "Excellent! 🌟",
  "Great answer! 💡",
  "Spot on! 🎯",
  "Perfect! 🏆",
  "You nailed it! 🔥",
];

export default async function (
  msg: Message,
  quoted: Message
): Promise<boolean> {
  if (!quoted.body) return false;

  const quizAttempts = await getQuizAttempts(quoted);
  if (quizAttempts) {
    const question = quiz[parseInt(quizAttempts.qid)];

    if (msg.body.trim().toLowerCase() === question.answer.toLowerCase()) {
      await Promise.all([
        msg.reply(done[Math.floor(Math.random() * done.length)]),
        setQuizAttemptAnswered(msg, quoted),
      ]);
      return true;
    }
  }
  return false;
}

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

    const userInput = msg.body.trim().toLowerCase();
    const answer = question.answer.replace(/\s+/g, "").toLowerCase();
    // Find the index of the correct answer in choices
    const answerIndex =
      question.choices ?
      question.choices.findIndex(
        (c: string) => c.trim().replace(/\s+/g, "").toLowerCase() === answer
      ) + 1 : -1;

    if (
      userInput === answer ||
      (question.choices && userInput === answerIndex.toString())
    ) {
      await Promise.all([
        msg.reply(done[Math.floor(Math.random() * done.length)]),
        setQuizAttemptAnswered(msg, quoted),
        quoted.delete(true, true),
      ]);
      return true;
    }
  }
  return false;
}

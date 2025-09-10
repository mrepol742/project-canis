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
const wrong = [
  "Not quite! ❌",
  "Oops, try again! 🔄",
  "Close, but not correct. 🤔",
  "That's not it. 🚫",
  "Incorrect! ⚠️",
  "Give it another shot! 🎯",
  "Nope, not this time. 😅",
  "Almost, but not right. 🌀",
  "Sorry, that's wrong. 🙈",
  "Try once more! 🔁",
];

export default async function (
  msg: Message,
  quoted: Message,
): Promise<boolean> {
  if (!quoted.body) return false;

  const quizAttempts = await getQuizAttempts(quoted);
  if (quizAttempts) {
    try {
      const question = quiz[parseInt(quizAttempts.qid)];

      const userInput = msg.body.trim().toLowerCase();
      const answer = question.answer.replace(/\s+/g, "").toLowerCase();
      // Find the index of the correct answer in choices
      const answerIndex = question.choices
        ? question.choices.findIndex(
            (c: string) =>
              c.trim().replace(/\s+/g, "").toLowerCase() === answer,
          ) + 1
        : -1;

      if (
        userInput === answer ||
        (question.choices && userInput === answerIndex.toString())
      ) {
        await Promise.all([
          msg.reply(done[Math.floor(Math.random() * done.length)]),
          setQuizAttemptAnswered(msg, quoted),
          quoted.delete(true, true),
        ]);
      } else {
        await Promise.all([
          msg.reply(wrong[Math.floor(Math.random() * wrong.length)]),
          quoted.delete(true, true),
        ]);
      }
      return true;
    } catch (error: any) {}
  }
  return false;
}

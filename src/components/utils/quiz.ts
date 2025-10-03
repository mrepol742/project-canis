import { Message } from "whatsapp-web.js";
import { addUserQuizPoints } from "../services/user";
import { quiz } from "../utils/data";
import log from "../utils/log";
import redis from "../redis";

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
  try {
    const key = `quiz:${quoted.id.id}`;
    const result = await redis.get(key);
    if (!result) return false;

    const quizAttempt = JSON.parse(result);
    const question = quiz[parseInt(quizAttempt.quiz_id)];
    const userInput = msg.body.trim().toLowerCase().replace(/!/g, "");
    const answer = question.answer.replace(/\s+/g, "").toLowerCase();
    // Find the index of the correct answer in choices
    const answerIndex = question.choices
      ? question.choices.findIndex(
          (c: string) => c.trim().replace(/\s+/g, "").toLowerCase() === answer,
        ) + 1
      : -1;

    if (
      userInput === answer ||
      (question.choices && userInput === answerIndex.toString())
    ) {
      await Promise.all([
        redis.del(key),
        msg.reply(done[Math.floor(Math.random() * done.length)]),
        addUserQuizPoints(msg, true),
        quoted.delete(true, true),
        log.info("QuizAnswered", "Correct", quoted.body),
      ]);
    } else {
      await Promise.all([
        redis.del(key),
        msg.reply(wrong[Math.floor(Math.random() * wrong.length)]),
        addUserQuizPoints(msg, false),
        quoted.delete(true, true),
        log.info("QuizAnswered", "Wrong", quoted.body),
      ]);
    }
    return true;
  } catch (error: any) {}

  return false;
}

import { Message } from "whatsapp-web.js";
import { addUserQuizPoints } from "../services/user";
import { quiz, done, wrong } from "../utils/data";
import log from "../utils/log";
import startNewQuiz from "../../commands/quiz";
import redis from "../redis";

export default async function (msg: Message): Promise<void> {
  try {
    if (!msg.hasQuotedMsg) return;

    const quoted: Message = await msg.getQuotedMessage();
    if (!quoted.body) return;

    const key = `quiz:${quoted.id.id}`;
    const result = await redis.get(key);
    if (!result) return;

    const quizAttempt = JSON.parse(result);
    const question = quiz[parseInt(quizAttempt.quiz_id)];
    const userInput = msg.body.trim().toLowerCase();
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
      log.info("QuizAnswered", quizAttempt.quiz_id, "correct");
      await Promise.allSettled([
        redis.del(key),
        addUserQuizPoints(msg, true),
        quoted.delete(true, true),
        startNewQuiz(msg, true),
      ]);
    } else {
      log.info("QuizAnswered", quizAttempt.quiz_id, "wrong");
      await Promise.allSettled([
        redis.del(key),
        msg.reply(wrong[Math.floor(Math.random() * wrong.length)]),
        addUserQuizPoints(msg, false),
        quoted.delete(true, true),
      ]);
    }
  } catch (error: any) {}
}

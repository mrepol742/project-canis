import { Message } from "whatsapp-web.js";
import { addUserQuizPoints } from "../services/user";
import { riddles, done, wrong } from "../utils/data";
import log from "../utils/log";
import redis from "../redis";

export default async function (
  msg: Message,
  quoted: Message,
): Promise<boolean> {
  try {
    const key = `riddle:${quoted.id.id}`;
    const result = await redis.get(key);
    if (!result) return false;

    const riddleAttempt = JSON.parse(result);
    const riddle = riddles[parseInt(riddleAttempt.riddle_id)];
    const userInput = msg.body
      .trim()
      .toLowerCase()
      .replace(/!/g, "")
      .split(/\s+/);
    const answer = riddle.answer.toLowerCase();

    let isCorrect = false;

    for (let word of userInput) {
      if (word.length >= 2 && answer.includes(word)) {
        isCorrect = true;
        break;
      }
    }

    if (isCorrect) {
      await Promise.all([
        redis.del(key),
        msg.reply(done[Math.floor(Math.random() * done.length)]),
        addUserQuizPoints(msg, true, 20),
        quoted.delete(true, true),
        log.info("RiddleAnswered", "Correct", quoted.body),
      ]);
    } else {
      await Promise.all([
        redis.del(key),
        msg.reply(wrong[Math.floor(Math.random() * wrong.length)]),
        addUserQuizPoints(msg, false, 0.2),
        quoted.delete(true, true),
        log.info("RiddleAnsweredWrong", "Wrong", quoted.body),
      ]);
    }
    return true;
  } catch (error: any) {}

  return false;
}

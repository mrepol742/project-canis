import { Message } from "whatsapp-web.js";
import { addUserQuizPoints } from "../services/user";
import { riddles, done, wrong } from "../utils/data";
import log from "../utils/log";
import startNewRiddle from "../../commands/riddle";
import redis from "../redis";

export default async function (msg: Message): Promise<void> {
  try {
    if (!msg.hasQuotedMsg) return;

    const quoted: Message = await msg.getQuotedMessage();
    if (!quoted.body) return;

    const key = `riddle:${quoted.id.id}`;
    const result = await redis.get(key);
    if (!result) return;

    const riddleAttempt = JSON.parse(result);
    const riddle = riddles[parseInt(riddleAttempt.riddle_id)];
    const userInput = msg.body.trim().toLowerCase().split(/\s+/);
    const answer = riddle.answer.toLowerCase();

    let isCorrect = false;

    for (let word of userInput) {
      if (word.length >= 2 && answer.includes(word)) {
        isCorrect = true;
        break;
      }
    }

    if (isCorrect) {
      log.info("RiddleAnswered", riddleAttempt.quiz_id, "correct");
      await Promise.allSettled([
        redis.del(key),
        addUserQuizPoints(msg, true, 20),
        quoted.delete(true, true),
        startNewRiddle(msg, true),
      ]);
    } else {
      log.info("RiddleAnsweredWrong", riddleAttempt.quiz_id, "wrong");
      await Promise.allSettled([
        redis.del(key),
        msg.reply(wrong[Math.floor(Math.random() * wrong.length)]),
        addUserQuizPoints(msg, false, 0.2),
        quoted.delete(true, true),
      ]);
    }
  } catch (error: any) {}
}

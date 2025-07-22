import { prisma } from "../prisma";
import log from "../utils/log";
import { Message } from "whatsapp-web.js";

export async function newQuizAttempt(msg: Message, qid: string): Promise<void> {
  try {
    const lid = msg.id.remote.split("@")[0];
    await prisma.quiz.create({
      data: {
        mid: msg.id.id,
        lid,
        qid,
      },
    });
  } catch (error) {
    log.error("Database", "Failed to add quiz.", error);
  }
}

export async function getQuizAttempts(msg: Message): Promise<any | null> {
  try {
    if (!msg.id || !msg.id.remote) return [];

    const quiz = await prisma.quiz.findUnique({
      where: { mid: msg.id.id, answeredAt: null },
    });

    return quiz;
  } catch (error) {
    log.error("Database", `Failed to get quiz attempts.`, error);
  }
  return null;
}

export async function setQuizAttemptAnswered(
  msg: Message,
  quoted: Message
): Promise<void> {
  try {
    if (!quoted.id || !quoted.id.remote) return;

    await Promise.all([
      prisma.quiz.update({
        where: { mid: quoted.id.id },
        data: { answeredAt: new Date() },
      }),
      prisma.user.update({
        where: {
          lid: msg.author ? msg.author.split("@")[0] : msg.from.split("@")[0],
        },
        data: {
          quizAnswered: {
            increment: 1,
          },
        },
      }),
    ]);
  } catch (error) {
    log.error("Database", `Failed to set quiz attempt as answered.`, error);
  }
}

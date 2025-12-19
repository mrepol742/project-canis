import prisma from "../prisma";
import log from "../../components/utils/log";
import { Message } from "whatsapp-web.js";
import redis from "../redis";
import * as Sentry from "@sentry/node";

const MAX_LENGTH = 191;

function filterContent(body: string): string {
  if (body.length <= MAX_LENGTH) return body;

  const cutoff = MAX_LENGTH - " [REDACTED]".length;
  return body.slice(0, cutoff) + " [REDACTED]";
}

export async function addUserQuizPoints(
  msg: Message,
  answered: Boolean,
  points: number = 5,
): Promise<void> {
  try {
    const lid = (msg.author ?? msg.from).split("@")[0];

    await prisma.user.update({
      where: {
        lid,
      },
      data: {
        commandCount: {
          increment: 1,
        },
        quizAnswered: {
          increment: answered ? 1 : 0,
        },
        quizAnsweredWrong: {
          increment: answered ? 0 : 1,
        },
        points: {
          increment: answered ? points : 1,
        },
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to set quiz attempt answered.`, error);
  }
}

export async function findOrCreateUser(msg: Message): Promise<boolean> {
  const lid = (msg.author ?? msg.from).split("@")[0];

  const min = 0.1;
  const max = 0.9;
  const rand = Math.random() * (max - min) + min;
  const points = parseFloat(rand.toFixed(1));

  try {
    const existingUser = await prisma.user.findUnique({
      where: { lid },
      select: { id: true }
    });

    if (existingUser) {
      await prisma.user.update({
        where: { lid },
        data: {
          commandCount: { increment: 1 },
          points: { increment: points },
        },
      });

      return false;
    }

    const contact = await msg.getContact();

    const name = contact?.pushname || contact?.name || "null";
    const number = contact?.number || "0";
    const countryCode = contact
      ? await contact.getCountryCode().catch(() => "null")
      : "null";
    const about = contact
      ? await contact.getAbout().catch(() => null)
      : null;

    await prisma.user.create({
      data: {
        lid,
        name,
        number,
        countryCode,
        type: contact?.isBusiness ? "business" : "private",
        mode: msg.author ? "group" : "private",
        about: about ? filterContent(about) : null,
        commandCount: 1,
        points,
      },
    });

    msg.react("✅").catch(() => {});
    return true;
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to find or create user.`, error);
    return false;
  }
}

export async function getUserbyLid(lid: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        lid,
      },
    });
    return user;
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to get user by lid: ${lid}`, error);
  }
  return null;
}

export async function getUserCount(): Promise<number> {
  try {
    const count = await prisma.user.count();
    return count;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to get user count:", error);
  }
  return 0;
}

export async function getUsersPoints(): Promise<any[]> {
  try {
    const users = await prisma.user.groupBy({
      by: ["name", "points"],
      _sum: {
        points: true,
      },
      where: {
        points: {
          not: 0,
        },
      },
      orderBy: {
        _sum: {
          points: "desc",
        },
      },
      take: 15,
    });

    return users.map(
      (u: { name: string; _sum: { points: number | null } }) => ({
        name: u.name,
        points: u._sum.points,
      }),
    );
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to get users.`, error);
  }
  return [];
}

export async function getUsersCommandCount(): Promise<any[]> {
  try {
    const users = await prisma.user.groupBy({
      by: ["name", "commandCount"],
      _sum: {
        commandCount: true,
      },
      where: {
        commandCount: {
          not: 0,
        },
      },
      orderBy: {
        _sum: {
          commandCount: "desc",
        },
      },
      take: 15,
    });

    return users.map(
      (u: { name: string; _sum: { commandCount: number | null } }) => ({
        name: u.name,
        commandCount: ((u._sum.commandCount ?? 0) * 0.5) / 2,
      }),
    );
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to get users.`, error);
  }
  return [];
}

export async function getUsersQuiz(): Promise<any[]> {
  try {
    const users = await prisma.user.groupBy({
      by: ["name", "quizAnswered", "quizAnsweredWrong"],
      _sum: {
        quizAnswered: true,
        quizAnsweredWrong: true,
      },
      where: {
        OR: [{ quizAnswered: { not: 0 } }, { quizAnsweredWrong: { not: 0 } }],
      },
      orderBy: {
        _sum: {
          quizAnswered: "desc",
        },
      },
      take: 15,
    });

    return users.map(
      (u: {
        name: string;
        _sum: { quizAnswered: number | null; quizAnsweredWrong: number | null };
      }) => ({
        name: u.name,
        score: (u._sum.quizAnswered ?? 0) + (u._sum.quizAnsweredWrong ?? 0) / 2,
      }),
    );
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to get users.`, error);
  }
  return [];
}

export async function getBlockUser(lid: string): Promise<boolean> {
  try {
    const isBlocked = await redis.get(`block:${lid}`);
    return !!isBlocked;
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", `Failed to get block user: ${lid}`, error);
  }
  return false;
}

export async function addBlockUser(lid: string): Promise<void> {
  try {
    await redis.set(`block:${lid}`, "1");
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", `Failed to block user: ${lid}`, error);
  }
}

export async function unblockUser(lid: string): Promise<void> {
  try {
    redis.del(`block:${lid}`);
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", `Failed to block user: ${lid}`, error);
  }
}

export async function setAdmin(lid: string, value: boolean): Promise<void> {
  try {
    const key = `admin:${lid}`;
    if (value) await redis.set(key, "1");
    else await redis.del(key);
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", `Failed to set admin for: ${lid}`, error);
  }
}

export async function isAdmin(lid: string): Promise<boolean> {
  try {
    const key = `admin:${lid}`;
    const val = await redis.get(key);
    return val !== null;
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", `Failed to check admin: ${lid}`, error);
  }
  return false;
}

export async function deductUserPoints(
  lid: string,
  points: number,
): Promise<void> {
  try {
    await prisma.user.update({
      where: { lid },
      data: {
        points: {
          decrement: points,
        },
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to deduct user points: ${lid}`, error);
  }
}

export async function addUserPoints(
  lid: string,
  points: number,
): Promise<void> {
  try {
    await prisma.user.update({
      where: { lid },
      data: { points: { increment: points } },
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to add user points: ${lid}`, error);
  }
}

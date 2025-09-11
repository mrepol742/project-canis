import { Message } from "whatsapp-web.js";
import redis from "../redis";
import log from "./log";
import { prisma } from "../prisma";

const LIMIT = 5;
const BASE_WINDOW_MS = 30 * 1000;
const PENALTY_INCREMENT_MS = 10 * 1000;

function getKey(number: string) {
  return `rate:${number}`;
}

export default async function rateLimiter(
  msg: Message,
): Promise<boolean | null> {
  const number = msg.from;
  const now = Date.now();
  const key = getKey(number);

  const entryRaw = await redis.get(key);
  let entry = entryRaw
    ? JSON.parse(entryRaw)
    : {
        timestamps: [] as number[],
        penaltyCount: 0,
        penaltyUntil: 0,
      };

  const isStillBlocked = entry.penaltyUntil > now;

  if (!isStillBlocked) {
    entry.timestamps = entry.timestamps.filter(
      (ts: number) => now - ts < BASE_WINDOW_MS,
    );
  }

  if (isStillBlocked || entry.timestamps.length >= LIMIT) {
    entry.penaltyCount += 1;

    entry.penaltyUntil =
      Math.max(entry.penaltyUntil, now) +
      entry.penaltyCount * PENALTY_INCREMENT_MS +
      BASE_WINDOW_MS;

    entry.timestamps = [];

    log.warn(
      "RateLimiter",
      `User ${number} blocked until ${new Date(entry.penaltyUntil).toLocaleTimeString()}`,
    );

    await Promise.all([
      redis.set(key, JSON.stringify(entry)),
      prisma.user.update({
        where: {
          lid: msg.author ? msg.author.split("@")[0] : msg.from.split("@")[0],
        },
        data: {
          quizAnswered: {
            decrement: 10,
          },
        },
      }),
    ]);
    if (entry.penaltyCount === 1) return null;
    return true;
  }

  entry.timestamps.push(now);
  await redis.set(key, JSON.stringify(entry));
  return false;
}

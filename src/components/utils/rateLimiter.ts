import redis from "../redis";
import log from "./log";
import { prisma } from "../prisma";

const LIMIT = 5;
const BASE_WINDOW_MS = 30 * 1000;
const PENALTY_INCREMENT_MS = 10 * 1000;

interface RateEntry {
  timestamps: number[];
  penaltyCount: number;
  penaltyUntil: number;
}

export async function resetRateLimit(lid: string) {
  try {
    redis.set(
      `rate:${lid}`,
      JSON.stringify({ timestamps: [], penaltyCount: 0, penaltyUntil: 0 }),
    );
  } catch (error) {
    log.error("RateLimiter", `Failed to reset rate limit: ${lid}`, error);
  }
}

export async function penalizeUser(
  lid: string,
  entry: RateEntry,
): Promise<RateEntry> {
  try {
    const now = Date.now();

    entry.penaltyCount += 1;
    entry.penaltyUntil =
      Math.max(entry.penaltyUntil, now) +
      entry.penaltyCount * PENALTY_INCREMENT_MS +
      BASE_WINDOW_MS;

    entry.timestamps = [];

    log.warn(
      "RateLimiter",
      `User ${lid} penalized until ${new Date(entry.penaltyUntil)}`,
    );

    await Promise.all([
      redis.set(`rate:${lid}`, JSON.stringify(entry)),
      prisma.user.update({
        where: { lid },
        data: { points: { decrement: 10 } },
      }),
    ]);

    return entry;
  } catch (error) {
    log.error("RateLimiter", `Failed to penalize user: ${lid}`, error);
  }
  return entry;
}

export async function rateLimiter(
  lid: string,
): Promise<{ value: RateEntry; status: boolean; overLimit: boolean }> {
  try {
    const now = Date.now();
    const key = `rate:${lid}`;

    const entryRaw = await redis.get(key);
    let entry: RateEntry = entryRaw
      ? JSON.parse(entryRaw)
      : { timestamps: [], penaltyCount: 0, penaltyUntil: 0 };

    const isStillBlocked = entry.penaltyUntil > now;

    if (!isStillBlocked) {
      entry.timestamps = entry.timestamps.filter(
        (ts) => now - ts < BASE_WINDOW_MS,
      );
    }

    if (isStillBlocked) {
      return {
        value: entry,
        status: true,
        overLimit: entry.timestamps.length >= LIMIT,
      };
    }

    entry.timestamps.push(now);
    await redis.set(key, JSON.stringify(entry));

    return {
      value: entry,
      status: isStillBlocked,
      overLimit: entry.timestamps.length >= LIMIT,
    };
  } catch (error) {
    log.error("RateLimiter", `Failed to rate limit: ${lid}`, error);
  }
  return {
    value: { timestamps: [], penaltyCount: 0, penaltyUntil: 0 },
    status: false,
    overLimit: false,
  };
}

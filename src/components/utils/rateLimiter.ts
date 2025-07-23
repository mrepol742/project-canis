import redis from "../redis";
import log from "./log";

const LIMIT = 3;
const BASE_WINDOW_MS = 60 * 1000;
const PENALTY_INCREMENT_MS = 10 * 1000;

function getKey(number: string) {
  return `rate:${number}`;
}

export default async function (number: string): Promise<boolean | null> {
  const now = Date.now();
  const key = getKey(number);

  // Get user entry from Redis
  const entryRaw = await redis.get(key);
  let entry = entryRaw
    ? JSON.parse(entryRaw)
    : {
        timestamps: [],
        notified: false,
        penaltyCount: 0,
        penaltyUntil: 0,
      };

  // Penalty check
  if (entry.penaltyUntil > now) {
    log.info(
      "RateLimiter",
      `User ${number} is under penalty until ${new Date(
        entry.penaltyUntil
      ).toLocaleTimeString()}`
    );
    if (!entry.notified) return null;
    entry.notified = true;
    await redis.set(key, JSON.stringify(entry));
    return false;
  }

  // Remove old timestamps
  entry.timestamps = entry.timestamps.filter(
    (ts: number) => now - ts < BASE_WINDOW_MS
  );

  if (entry.timestamps.length >= LIMIT) {
    entry.penaltyCount += 1;
    entry.penaltyUntil =
      now + BASE_WINDOW_MS + (entry.penaltyCount - 1) * PENALTY_INCREMENT_MS;
    entry.notified = false;
    entry.timestamps = [];
    log.warn(
      "RateLimiter",
      `User ${number} exceeded limit. Penalty until ${new Date(
        entry.penaltyUntil
      ).toLocaleTimeString()}`
    );
    await redis.set(key, JSON.stringify(entry));
    return false;
  }

  // Allowed
  entry.timestamps.push(now);
  entry.notified = false;
  await redis.set(key, JSON.stringify(entry));
  return true;
}

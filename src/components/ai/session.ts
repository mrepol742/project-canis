import redis from "../redis";
import log from "../utils/log";
import * as Sentry from "@sentry/node";

const SESSION_KEY = (chatId: string, lid: string) => `agent:session:${chatId}:${lid}`;
const SESSION_TTL = 600; // 10 min idle timeout

export async function isSessionActive(chatId: string, lid: string): Promise<boolean> {
  try {
    const val = await redis.get(SESSION_KEY(chatId, lid));
    return val !== null;
  } catch (err) {
    Sentry.captureException(err);
    return false;
  }
}

export async function activateSession(chatId: string, lid: string): Promise<void> {
  try {
    await redis.set(SESSION_KEY(chatId, lid), "1", {
      expiration: { type: "EX", value: SESSION_TTL },
    });
  } catch (err) {
    Sentry.captureException(err);
    log.error("Session", "Failed to activate session", err);
  }
}

export async function deactivateSession(chatId: string, lid: string): Promise<void> {
  try {
    await redis.del(SESSION_KEY(chatId, lid));
  } catch (err) {
    Sentry.captureException(err);
    log.error("Session", "Failed to deactivate session", err);
  }
}

import redis from "../redis";
import log from "../utils/log";
import * as Sentry from "@sentry/node";
import { AGENT_MAX_HISTORY, AGENT_THREAD_TTL } from "../../config";

export interface ThreadMessage {
  role: "user" | "assistant";
  content: string;
}

function threadKey(lid: string, chatId: string): string {
  return `agent:thread:${lid}:${chatId}`;
}

export async function getThread(
  lid: string,
  chatId: string,
): Promise<ThreadMessage[]> {
  try {
    const raw = await redis.get(threadKey(lid, chatId));
    if (!raw) return [];
    return JSON.parse(raw) as ThreadMessage[];
  } catch (err) {
    Sentry.captureException(err);
    log.error("Thread", "Failed to get thread", err);
    return [];
  }
}

export async function appendThread(
  lid: string,
  chatId: string,
  userContent: string,
  assistantContent: string,
): Promise<void> {
  try {
    const existing = await getThread(lid, chatId);
    const updated: ThreadMessage[] = [
      ...existing,
      { role: "user", content: userContent },
      { role: "assistant", content: assistantContent },
    ];
    const trimmed = updated.slice(-AGENT_MAX_HISTORY);
    await redis.set(threadKey(lid, chatId), JSON.stringify(trimmed), {
      expiration: { type: "EX", value: AGENT_THREAD_TTL },
    });
  } catch (err) {
    Sentry.captureException(err);
    log.error("Thread", "Failed to append to thread", err);
  }
}

export async function clearThread(lid: string, chatId: string): Promise<void> {
  try {
    await redis.del(threadKey(lid, chatId));
  } catch (err) {
    Sentry.captureException(err);
    log.error("Thread", "Failed to clear thread", err);
  }
}

export async function getThreadLength(
  lid: string,
  chatId: string,
): Promise<number> {
  const thread = await getThread(lid, chatId);
  return thread.length;
}

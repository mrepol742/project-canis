import { Client, Reaction } from "whatsapp-web.js";
import log from "../utils/log";
import sleep from "../utils/sleep";
import { getSetting } from "../services/settings";
import { penalizeUser, rateLimiter } from "../utils/rateLimiter";
import { getBlockUser } from "../services/user";
import * as Sentry from "@sentry/node";
import redis from "../redis";
import reactQueue from "../queue/react";

export default async function (client: Client, react: Reaction): Promise<void> {
  if (react.msgId.fromMe || react.id.fromMe) return;
  if (!react.reaction?.trim()) return;
  // ignore react if it is older than 60 seconds
  if (react.timestamp < Date.now() / 1000 - 60) return;

  // ignore @Meta AI and others
  if (react.senderId.split("@")[1] === "bot") return;

  const isPaused = await getSetting("paused");
  if (isPaused && isPaused === "on") return;

  const key = `react:${react.id.id}`;
  const alreadyReacted = await redis.get(key);
  if (alreadyReacted) return;

  const senderId = react.senderId.split("@")[0];
  /*
   * Block asshole users
   */
  const [isRateLimit, isBlockedUser, isMustRepeatReact] = await Promise.all([
    rateLimiter(senderId),
    getBlockUser(senderId),
    getSetting("react_repeater"),
  ]);

  if (isRateLimit.status || isRateLimit.value.timestamps.length > 5) {
    await penalizeUser(senderId, isRateLimit.value);
    return;
  }

  if (isBlockedUser || !isMustRepeatReact || isMustRepeatReact == "off") return;

  try {
    const message = await client.getMessageById(react.msgId._serialized);
    if (!message) return;

    const min = 2000;
    const max = 6000;
    const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;

    await sleep(randomMs);

    await Promise.allSettled([
      reactQueue.add(() => message.react(react.reaction)),
      redis.set(key, "1", {
        expiration: {
          type: "EX",
          value: 3600, // 1 hour
        },
      }),
    ]);
    log.info("Reaction", senderId, react.reaction);
  } catch (err) {
    Sentry.captureException(err);
    log.error("Failed to react back to message:", err);
  }
}

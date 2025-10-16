import { Client, Reaction } from "whatsapp-web.js";
import log from "../utils/log";
import sleep from "../utils/sleep";
import { getSetting } from "../services/settings";
import { rateLimiter } from "../utils/rateLimiter";
import { getBlockUser } from "../services/user";
import * as Sentry from "@sentry/node";

export default async function (client: Client, react: Reaction): Promise<void> {
  if (react.msgId.fromMe || react.id.fromMe) return;
  if (!react.reaction?.trim()) return;
  // ignore react if it is older than 60 seconds
  if (react.timestamp < Date.now() / 1000 - 60) return;

  const senderId = react.senderId.split("@")[0];
  /*
   * Block asshole users
   */
  const [isRateLimit, isBlockedUser, isMustRepeatReact] = await Promise.all([
    rateLimiter(senderId),
    getBlockUser(senderId),
    getSetting("react_repeater"),
  ]);

  if (
    isBlockedUser ||
    isRateLimit.status ||
    isRateLimit.value.timestamps.length > 5 ||
    !isMustRepeatReact ||
    isMustRepeatReact == "off"
  )
    return;

  try {
    const message = await client.getMessageById(react.msgId._serialized);
    if (!message) return;
    await sleep(2000);
    await message.react(react.reaction);
    log.info("Reaction", senderId, `Reacted to message with ${react.reaction}`);
  } catch (err) {
    Sentry.captureException(err);
    log.error("Failed to react back to message:", err);
  }
}

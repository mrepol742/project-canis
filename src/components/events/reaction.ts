import { Client, Reaction } from "whatsapp-web.js";
import log from "../utils/log";
import sleep from "../utils/sleep";
import { getSetting } from "../services/settings";
import { rateLimiter } from "../utils/rateLimiter";
import redis from "../redis";

export default async function (client: Client, react: Reaction) {
  if (react.msgId.fromMe || react.id.fromMe) return;
  if (!react.reaction?.trim()) return;
  // ignore react if it is older than 10 seconds
  if (react.timestamp < Date.now() / 1000 - 10) return;
  const isMustRepeatReact = await getSetting("react_repeater");
  if (!isMustRepeatReact || isMustRepeatReact == "off") return;

  const senderId = react.senderId.split("@")[0];

  /*
   * Block asshole users
   */
  const [isRateLimit, isBlockedUser] = await Promise.all([
    rateLimiter(senderId),
    redis.get(`block:${senderId}`),
  ]);

  if (!!isBlockedUser || isRateLimit.status) return;

  try {
    const message = await client.getMessageById(react.msgId._serialized);
    if (!message) return;
    await sleep(2000);
    await message.react(react.reaction);
    log.info("Reaction", senderId, `Reacted to message with ${react.reaction}`);
  } catch (error) {
    log.error("Failed to react back to message:", error);
  }
}

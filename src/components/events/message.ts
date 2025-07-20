import { Message } from "whatsapp-web.js";
import log from "../utils/log";
import { commands } from "../../index";
import rateLimiter from "../utils/rateLimiter";
import { isRateLimitError, getRateLimitInfo } from "../utils/rateLimit";
import sleep from "../utils/sleep";
import { findOrCreateUser, isBlocked } from "../services/user";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";
const superAdmin = process.env.SUPER_ADMIN || "";

export default async function message(msg: Message) {
  // ignore message if it is older than 10 seconds
  if (msg.timestamp < Date.now() / 1000 - 10) return;

  // process normalization
  msg.body = msg.body
    .normalize("NFKC")
    .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "")
    .trim();

  const prefix = !msg.body.startsWith(commandPrefix);
  const senderId = msg.from.split("@")[0];

  /*
   * Prefix
   */
  if (!commandPrefixLess && prefix) return;
  if (msg.fromMe && prefix) return;

  /*
   * Check if the message starts with the command prefix.
   */
  const messageBody = msg.body.split(" ")[0];
  const bodyHasPrefix = messageBody.startsWith(commandPrefix);
  const key = bodyHasPrefix
    ? messageBody.slice(commandPrefix.length).trim()
    : messageBody;
  const handler = commands[key.toLowerCase()];
  if (!handler) return;

  /*
   * Block users from running commands.
   */
  const isBlockedUser = await isBlocked(msg.author ? msg.author.split("@")[0] : senderId);
  if (isBlockedUser) {
    return;
  }

  /*
   * Rate limit commands to prevent abuse.
   */
  if (senderId !== superAdmin) {
    const rate = rateLimiter(msg.from);
    if (rate === null) return;
    if (!rate) {
      msg.reply("You are sending commands too fast. Please wait a minute.");
      return;
    }
  }

  /*
   * Role base restrictions.
   */
  if (handler.role === "admin" && !msg.fromMe && senderId !== superAdmin) {
    return;
  }

  if (debug) {
    log.info("Message", senderId, msg.body.slice(0, 150));
  }
  msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);

  /*
   * Execute the command handler.
   */
  try {
    await Promise.all([
      handler.exec(msg),
      (async () => {
        if (!msg.fromMe) {
          const user = await findOrCreateUser(msg);

          if (user) {
            await sleep(2000); // Prevent rate limiting issues
            await msg.react("✅");
          }
        }

        return Promise.resolve();
      })(),
    ]);
  } catch (error) {
    if (isRateLimitError(error)) {
      const rateLimitInfo = getRateLimitInfo(error);
      log.warn(key, "Rate limit exceeded", rateLimitInfo);
    } else {
      log.error(key, "Error occurred while processing the request:", error);
    }
    msg.reply("An error occurred while processing your request.");
  }
}

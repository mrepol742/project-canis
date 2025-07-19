import { Message } from "whatsapp-web.js";
import log from "../utils/log";
import { commands } from "../../index"
import rateLimiter from "../utils/rateLimiter";
import { isRateLimitError, getRateLimitInfo } from "../utils/rateLimit";
import sleep from "../utils/sleep";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";
const superAdmin = process.env.SUPER_ADMIN || "";

export default async function message(msg: Message){
  // ignore message if it is older than 10 seconds
  if (msg.timestamp < Date.now() / 1000 - 10) return;

  // process normalization
  msg.body = msg.body
    .normalize("NFKC")
    .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "");

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
    ? messageBody.slice(commandPrefix.length)
    : messageBody;
  const handler = commands[key.toLocaleLowerCase()];
  if (!handler) return;

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

  if (debug) log.info("Message", msg.body.slice(0, 255));
  msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);

  /*
   * Execute the command handler.
   */
  try {
    await sleep(1000); // Optional delay to prevent flooding
    await handler.exec(msg);
  } catch (error) {
    if (isRateLimitError(error)) {
      const rateLimitInfo = getRateLimitInfo(error);
      log.warn(key, "Rate limit exceeded", rateLimitInfo);
    } else {
      log.error(key, "Error occurred while processing the request:", error);
    }
    msg.reply("An error occurred while processing your request.");
  }
};

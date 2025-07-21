import {
  Client,
  Message,
  MessageContent,
  MessageSendOptions,
} from "whatsapp-web.js";
import log from "../utils/log";
import { commands } from "../../index";
import rateLimiter from "../utils/rateLimiter";
import { isRateLimitError, getRateLimitInfo } from "../utils/rateLimit";
import sleep from "../utils/sleep";
import { findOrCreateUser, isBlocked } from "../services/user";
import { client } from "../client";
import Font from "../utils/font";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";

export default async function message(msg: Message) {
  // ignore message if it is older than 10 seconds
  if (msg.timestamp < Date.now() / 1000 - 10) return;

  if (
    msg.hasQuotedMsg ||
    msg.isForwarded ||
    msg.isGif ||
    msg.isStatus ||
    msg.broadcast
  )
    return; // ignore them all

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
  const isBlockedUser = await isBlocked(
    msg.author ? msg.author.split("@")[0] : senderId
  );
  if (isBlockedUser) {
    return;
  }

  /*
   * Rate limit commands to prevent abuse.
   */
  if (!msg.fromMe) {
    const rate = rateLimiter(msg.from);
    if (rate === null) return;
    if (!rate) {
      msg.reply("Please wait a minute or so.");
      return;
    }
  }

  /*
   * Role base restrictions.
   */
  if (handler.role === "admin" && !msg.fromMe) {
    return;
  }

  if (debug) {
    log.info("Message", senderId, msg.body.slice(0, 150));
  }
  msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);

  const originalReply = msg.reply.bind(msg);
  msg.reply = async (
    content: MessageContent,
    chatId?: string,
    options?: MessageSendOptions
  ): Promise<Message> => {
    let messageBody = typeof content === "string" ? Font(content) : content;

    if (Math.random() < 0.5) {
      return await client.sendMessage(msg.id.remote, messageBody, options);
    }
    return await originalReply(messageBody, chatId, options);
  };

  if (
    /^(--?help|\bhelp\b|-h)$/i.test(
      msg.body.trim().replace(handler.command, "").trim()
    )
  ) {
    const response = `
    \`${handler.command}\`
    ${handler.description || "No description"}
    
    *Usage:* ${handler.usage || "No usage"}
    *Example:* ${handler.example || "No example"}
    *Role:* ${handler.role || "user"}
    *Cooldown:* ${handler.cooldown || 5000}ms
    `;
    await msg.reply(response);
    return;
  }

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

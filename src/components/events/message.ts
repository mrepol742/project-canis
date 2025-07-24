import {
  Client,
  Message,
  MessageContent,
  MessageSendOptions,
} from "whatsapp-web.js";
import log from "../utils/log";
import { commands } from "../../index";
import rateLimiter from "../utils/rateLimiter";
import sleep from "../utils/sleep";
import { findOrCreateUser, isBlocked } from "../services/user";
import { client } from "../client";
import Font from "../utils/font";
import quiz from "./quiz";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";

export default async function (msg: Message) {
  // ignore message if it is older than 10 seconds
  if (msg.timestamp < Date.now() / 1000 - 10) return;

  if (
    // (msg.hasQuotedMsg && !msg.fromMe) ||
    msg.isForwarded ||
    msg.isGif ||
    msg.isStatus ||
    msg.broadcast
  )
    return; // ignore them all

  /*
   *
   * Quiz command validation
   */
  if (msg.hasQuotedMsg) {
    const quoted = await msg.getQuotedMessage();
    if (await quiz(msg, quoted)) return;
  }

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
    const rate = await rateLimiter(msg.from);
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
      (async () => {
        if (msg.fromMe) return;

        const chat = await msg.getChat();
        chat.sendStateTyping();
      })(),

      handler.exec(msg),

      (async () => {
        const user = await findOrCreateUser(msg);

        if (user) {
          await sleep(5000); // Prevent rate limiting issues
          await msg.react("✅");
        }

        return Promise.resolve();
      })(),
    ]);
  } catch (error: any) {
    if (error.response) {
      const { status, headers } = error.response;
      const statusMessages: Record<number, string> = {
        429: "Rate limit exceeded",
        524: "timed out",
        500: "Internal server error",
        404: "Not found",
        403: "Forbidden",
        400: "Bad request",
        503: "Service unavailable",
        408: "Request timeout",
        401: "Unauthorized",
        422: "Unprocessable entity",
        504: "Gateway timeout",
        502: "Bad gateway",
        301: "Moved permanently",
      };

      if (statusMessages[status]) {
        const logFn = status === 500 ? log.error : log.warn;
        logFn(key, statusMessages[status], { status, headers });
        const text = `
        \`${statusMessages[status]}\`

          Error fetching data for "${key}" command the
          provider returned a ${status} status code.
        `;
        await msg.reply(text);
        return;
      }
    }
    log.error(
      key,
      "Unexpected error occurred while processing the request:",
      error
    );
    await msg.reply(
      `An unexpected error occurred while processing your request for "${key}". Please try again later.`
    );
  }
}

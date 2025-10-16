import {
  Client,
  Message,
  MessageContent,
  MessageSendOptions,
} from "whatsapp-web.js";
import log from "../utils/log";
import { commands } from "../utils/cmd/loader";
import { penalizeUser, rateLimiter } from "../utils/rateLimiter";
import sleep from "../utils/sleep";
import { findOrCreateUser, getBlockUser } from "../services/user";
import { client } from "../client";
import Font from "../utils/font";
import quiz from "../utils/quiz";
import riddle from "../utils/riddle";
import { getSetting } from "../services/settings";
import { errors, mentionResponses } from "../utils/data";
import { funD, happyEE, sadEE, loveEE } from "../../data/reaction";
import { containsAny } from "../utils/string";
import { InstantDownloader } from "../utils/instantdl/downloader";
import { checkInappropriate } from "../utils/contentChecker";
import prisma from "../prisma";
import redis from "../redis";
import queue from "../queue";
import regex from "../emoji";
import ai from "../../commands/ai";
import * as Sentry from "@sentry/node";

const commandPrefix: string = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess: boolean = process.env.COMMAND_PREFIX_LESS === "true";

export default async function (msg: Message, type: string): Promise<void> {
  // ignore message if it is older than 60 seconds
  if (!msg.body) return;
  if (msg.timestamp < Date.now() / 1000 - 60 && type === "create") return;
  if (msg.isGif || msg.isStatus || msg.broadcast || msg.isForwarded) return; // ignore them all
  const lid: string = msg.author
    ? msg.author.split("@")[0]
    : msg.from.split("@")[0];

  const prefix: boolean = !msg.body.startsWith(commandPrefix);

  /*
   * Prefix
   */
  if (!commandPrefixLess && prefix) return;
  if (msg.fromMe && prefix) return;

  /*
   * Block users from running commands.
   * will always return false if its admin
   */
  const [rateLimitResult, isBlockedUser] = await Promise.all([
    (async () => {
      if (msg.fromMe) {
        return {
          status: false,
          value: { timestamps: [], penaltyCount: 0, penaltyUntil: 0 },
        };
      }

      return await rateLimiter(lid);
    })(),
    (async () => {
      if (msg.fromMe) {
        return false;
      }

      const isBlocked = await getBlockUser(lid);
      // If the Redis key exists (non-null), return true
      return isBlocked;
    })(),
  ]);

  if (isBlockedUser) return;

  // process normalization
  msg.body = msg.body
    .normalize("NFKC")
    .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "") // diacritics
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, "") // zero-width chars
    .trim();

  /*
   * Check if the message starts with the command prefix.
   */

  const rawBody = msg.body;

  const prefixRegex = new RegExp(`^(${commandPrefix})\\s*`, "i");
  const bodyHasPrefix = prefixRegex.test(rawBody);
  const cleanedBody = bodyHasPrefix
    ? rawBody.replace(prefixRegex, "")
    : rawBody;

  const normalizedBody = cleanedBody.replace(/\s+/g, " ").trim();
  const [command, ...rest] = normalizedBody.split(" ");
  const key = command.toLocaleLowerCase("en");

  msg.body = [command, ...rest].join(" ").toLocaleLowerCase("en");
  const handler = commands[key];

  // stop here
  // the command matched to the usage but the input aint
  if (
    handler &&
    handler.usage === handler.command &&
    handler.command !== msg.body
  )
    return;

  if (!handler) {
    if (rateLimitResult.status || rateLimitResult.value.timestamps.length > 5)
      return;

    await Promise.allSettled([
      quiz(msg),
      riddle(msg),
      queue.add(() => InstantDownloader(msg)),
      (async () => {
        // override the msg!
        const react = { ...msg };
        const isMustautoReact = await getSetting("auto_react");
        if ((!isMustautoReact && isMustautoReact != "on") || react.fromMe)
          return;

        react.react = async (reaction: string): Promise<void> => {
          // add delay for more
          // humanly like interaction
          const min = 2000;
          const max = 6000;
          const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;

          await sleep(randomMs);
          const isEmoji = /.*[A-Za-z0-9].*/.test(reaction);
          log.info("AutoReact", lid, reaction);

          if (Math.random() < 0.1 && !isEmoji)
            if (Math.random() < 0.2)
              (await client()).sendMessage(react.id.remote, reaction);
            else await msg.reply(reaction);
          else await msg.react(reaction);
        };

        const emojis = [
          ...new Set([...react.body.matchAll(regex)].map((m) => m[0])),
        ];
        if (emojis.length > 0) {
          await react.react(emojis[Math.floor(Math.random() * emojis.length)]);
        } else if (containsAny(react.body, funD)) {
          await react.react("🤣");
        } else if (containsAny(react.body, happyEE)) {
          await msg.reply(funD[Math.floor(Math.random() * funD.length)]);
        } else if (containsAny(react.body, sadEE)) {
          await react.react("😭");
        } else if (containsAny(react.body, loveEE)) {
          await react.react("❤️");
        }

        const botId = (await client()).info.wid._serialized;
        if (msg.mentionedIds.length == 0 || !msg.mentionedIds.includes(botId))
          return;

        if (msg.body === `@${botId}`) {
          await msg.reply(
            mentionResponses[
              Math.floor(Math.random() * mentionResponses.length)
            ],
          );
          return;
        }

        msg.body += `Sender name is: @${lid}`;
        msg.body = msg.body.replaceAll(
          `@${lid}`,
          process.env.PROJECT_CANIS_ALIAS || "Canis",
        );
        msg.mentionedIds = msg.mentionedIds.map((mentionedId: string) =>
          mentionedId === botId ? lid : mentionedId,
        );
        await ai(msg);
      })(),
    ]);
    return;
  }

  if (rateLimitResult.status || rateLimitResult.value.timestamps.length > 5) {
    await penalizeUser(lid, rateLimitResult.value);
    return;
  }

  /*
   * Role base restrictions.
   */
  if (handler.role === "admin" && !msg.fromMe) {
    return;
  }

  log.info("Message", lid, msg.body.slice(0, 150));
  msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);

  /*
   *
   * Override the default function
   *     reply(content: MessageContent,
   *           chatId?: string,
   *           options?: MessageSendOptions) Promise<Message>
   */
  const originalReply = msg.reply.bind(msg);
  msg.reply = async (
    content: MessageContent,
    chatId?: string,
    options?: MessageSendOptions,
  ): Promise<Message> => {
    let messageBody = typeof content === "string" ? Font(content) : content;
    log.info("ReplyMessage", lid, content.toString().slice(0, 150));

    if (!msg.fromMe) {
      const chat = await msg.getChat();
      chat.sendStateTyping();
    }

    if (Math.random() < 0.5)
      return (await client()).sendMessage(msg.id.remote, messageBody, options);
    return await originalReply(messageBody, chatId, options);
  };

  if (!msg.fromMe) {
    const isInapproiateResponse = checkInappropriate(msg.body);
    if (isInapproiateResponse.isInappropriate) {
      const text =
        "You have been blocked. For more information \`terms\` & \`privacy\`.";
      await Promise.allSettled([
        originalReply(text),
        redis.set(`block:${lid}`, "1"),
        prisma.user.update({
          where: { lid },
          data: { points: { decrement: 100 } },
        }),
      ]);

      log.info("BlockUser", lid);
      return;
    }
  }

  await Promise.allSettled([
    (async () => {
      /*
       * Execute the command handler.
       */
      try {
        handler.exec(msg);
      } catch (error: any) {
        Sentry.captureException(error);
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
            log.error(key, error);
            const text = `
            \`${errors[Math.floor(Math.random() * errors.length)]}\`\`

            We encountered an error while processing ${key}.
            Provider returned an error ${statusMessages[status]}.
            `;
            await msg.reply(text);
            return;
          }
        }
        log.error(key, error);
        const text = `
        \`${errors[Math.floor(Math.random() * errors.length)]}\`

        We encountered an error while processing ${key}.
        `;
        await msg.reply(text);
      }
    })(),
    findOrCreateUser(msg),
  ]);
}

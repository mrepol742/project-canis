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
import {
  addBlockUser,
  deductUserPoints,
  findOrCreateUser,
  getBlockUser,
  isAdmin,
} from "../services/user";
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
  try {
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
    const [rateLimitResult, isBlockedUser, isPaused] = await Promise.all([
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
      getSetting("paused"),
    ]);

    if (isBlockedUser || (isPaused && isPaused === "on" && !msg.fromMe)) return;

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
    const newMessageBody = [key, ...rest].join(" ");
    const handler = commands[key];

    // stop here
    // the command matched to the usage but the input aint
    if (
      handler &&
      handler.usage === handler.command &&
      handler.command !== newMessageBody
    )
      return;

    if (!handler) {
      if (rateLimitResult.status || rateLimitResult.value.timestamps.length > 5)
        return;

      msg.body = normalizedBody;

      await Promise.allSettled([
        quiz(msg),
        riddle(msg),
        queue.add(() => InstantDownloader(msg)),
        (async () => {
          // override the msg!
          const react = { ...msg };
          const [isMustautoReact, alreadyReacted] = await Promise.all([
            getSetting("auto_react"),
            redis.get(`react:${msg.id.id}`),
          ]);
          if (
            (!isMustautoReact && isMustautoReact != "on") ||
            alreadyReacted ||
            react.fromMe
          )
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
            await react.react(
              emojis[Math.floor(Math.random() * emojis.length)],
            );
          } else if (containsAny(react.body, funD)) {
            await react.react("🤣");
          } else if (containsAny(react.body, happyEE)) {
            await msg.reply(funD[Math.floor(Math.random() * funD.length)]);
          } else if (containsAny(react.body, sadEE)) {
            await react.react("😭");
          } else if (containsAny(react.body, loveEE)) {
            await react.react("❤️");
          }
        })(),
        (async () => {
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

    if (handler.role === "super-admin" && !msg.fromMe) {
      return;
    } else if (handler.role === "admin") {
      const ok = await isAdmin(lid);
      if (!ok) return;
    }

    log.info("Message", lid, msg.body.slice(0, 150));
    msg.body = newMessageBody;

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
        return (await client()).sendMessage(
          msg.id.remote,
          messageBody,
          options,
        );
      return await originalReply(messageBody, chatId, options);
    };

    if (!msg.fromMe) {
      const isInapproiateResponse = checkInappropriate(msg.body);
      if (isInapproiateResponse.isInappropriate) {
        const text =
          "You have been blocked. For more information \`terms\` & \`privacy\`.";
        await Promise.allSettled([
          originalReply(text),
          addBlockUser(lid),
          deductUserPoints(lid, 20),
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
          await handler.exec(msg);
        } catch (error) {
          Sentry.captureException(error);
          log.error(key, error);
          await msg.reply(errors[Math.floor(Math.random() * errors.length)]);
        }
      })(),
      findOrCreateUser(msg),
    ]);
  } catch (err) {
    Sentry.captureException(err);
    log.error("Error handling call:", err);
  }
}

import { Message, MessageContent, MessageSendOptions } from "whatsapp-web.js";
import log from "../utils/log";
import { commands } from "../utils/cmd/loader";
import { penalizeUser, rateLimiter } from "../utils/rateLimiter";
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
import autoReaction from "../utils/message/react";
import { InstantDownloader } from "../utils/instantdl/downloader";
import { checkInappropriate } from "../utils/contentChecker";
import redis from "../redis";
import downloadQueue from "../queue/download";
import reactQueue from "../queue/react";
import ai from "../../commands/ai";
import * as Sentry from "@sentry/node";
import {
  COMMAND_PREFIX,
  COMMAND_PREFIX_LESS,
  PROJECT_CANIS_ALIAS,
  PROJECT_ENABLE_BOT_FONT,
} from "../../config";

export default async function (msg: Message, type: string): Promise<void> {
  try {
    // ignore message if it is older than 60 seconds
    if (!msg.body) return;
    if (msg.timestamp < Date.now() / 1000 - 60 && type === "create") return;
    if (msg.isGif || msg.isStatus || msg.broadcast || msg.isForwarded) return; // ignore them all

    // ignore @Meta AI and others
    if (msg.author && msg.author.split("@")[1] === "bot") return;

    const lid: string = msg.author
      ? msg.author.split("@")[0]
      : msg.from.split("@")[0];

    const prefix: boolean = !msg.body.startsWith(COMMAND_PREFIX);

    /*
     * Prefix
     */
    if (!COMMAND_PREFIX_LESS && prefix) return;
    if (msg.fromMe && prefix) return;

    const receivedAt = Date.now();

    /*
     * Block users from running commands.
     * will always return false if its admin
     */
    const [rateLimitResult, isBlockedUser, isPaused, isUserAdmin] =
      await Promise.all([
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
        isAdmin(lid),
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

    const prefixRegex = new RegExp(`^(${COMMAND_PREFIX})\\s*`, "i");
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
        downloadQueue.add(() => InstantDownloader(msg)),
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

          reactQueue.add(() => autoReaction(msg));
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
          msg.body = msg.body.replaceAll(`@${lid}`, PROJECT_CANIS_ALIAS);
          msg.mentionedIds = msg.mentionedIds.map((mentionedId: string) =>
            mentionedId === botId ? lid : mentionedId,
          );
          await ai(msg);
        })(),
      ]);
      return;
    }

    if (rateLimitResult.status || rateLimitResult.value.timestamps.length > 5) {
      await Promise.allSettled([
        penalizeUser(lid, rateLimitResult.value),
        msg.reply("You have been detected as spam, please wait for a while."),
      ]);
      return;
    }

    const isSuperAdmin = msg.fromMe;
    const isAdminUser = isUserAdmin || isSuperAdmin;

    if (
      (handler.role === "super-admin" && !isSuperAdmin) ||
      (handler.role === "admin" && !isAdminUser)
    ) {
      return;
    }

    log.info("Message", lid, key);

    if (newMessageBody.split(" ").length === 1 && msg.hasQuotedMsg) {
      const qoutedMessage = await msg.getQuotedMessage();
      msg.body = (newMessageBody + " " + qoutedMessage.body).trim();
    } else {
      msg.body = newMessageBody;
    }

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
      let messageBody =
        typeof content === "string" && PROJECT_ENABLE_BOT_FONT
          ? Font(content)
          : content;
      const latency = Date.now() - receivedAt;
      const latencySec = (latency / 1000).toFixed(2);
      log.info("Reply", lid, `${key} ${latencySec}s`);

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

      if (msg.hasQuotedMsg) {
        const quoted = await msg.getQuotedMessage();
        return await quoted.reply(messageBody, chatId, options);
      }

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

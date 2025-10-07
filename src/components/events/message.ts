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
import { findOrCreateUser, isBlocked } from "../services/user";
import { client } from "../client";
import Font from "../utils/font";
import quiz from "../utils/quiz";
import { errors } from "../utils/data";
import emojiRegex from "emoji-regex";
import { funD, happyEE, sadEE, loveEE } from "../../data/reaction";
import { containsAny } from "../utils/string";
import { phishingSet } from "../../index";
import { getSetting } from "../services/settings";
import { normalize } from "../utils/url";
import { InstantDownloader } from "../utils/instantdl/downloader";
import riddle from "../utils/riddle";
import { checkInappropriate } from "../utils/contentChecker";
import { prisma } from "../prisma";

const regex = emojiRegex();
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";
const isPhishtankEnable = process.env.PHISHTANK_ENABLE === "true";
const mentionResponses = [
  "👀 Did someone just say my name?",
  "Bruh, why me again? 😂",
  "Oh no… not me 😭",
  "You called? Or just summoning me like Voldemort?",
  "Here I am, what’s the emergency? 🚨",
  "Why always me tho 🤔",
  "Plot twist: I was just about to mention YOU.",
  "Careful… mention me three times and I appear 👻",
  "My ears were burning 🔥",
  "Did you just @ me for vibes, or do I owe you money? 💸",
];

export default async function (msg: Message, type: string) {
  // ignore message if it is older than 10 seconds
  if (!msg.body) return;
  if (msg.timestamp < Date.now() / 1000 - 10 && type === "create") return;
  if (msg.isGif || msg.isStatus || msg.broadcast) return; // ignore them all
  const lid = msg.author ? msg.author.split("@")[0] : msg.from.split("@")[0];

  const prefix = !msg.body.startsWith(commandPrefix);

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

      return rateLimiter(lid);
    })(),
    (async () => {
      if (msg.fromMe) {
        return false;
      }

      return isBlocked(lid);
    })(),
  ]);

  if (isBlockedUser) return;

  /*
   *
   * Check for scam urls
   */
  if (isPhishtankEnable) {
    Promise.resolve().then(async () => {
      const extractUrls = msg.body.match(/(https?:\/\/[^\s]+)/g) || [];
      const urls = extractUrls
        .map((url) => normalize(url))
        .filter((u): u is string => Boolean(u));
      const spamUrls = urls.filter((url) => phishingSet.has(url));
      if (spamUrls.length == 0) return;

      const text = `
    \`Phishing Alert\`

    We've found that this url(s): \`${spamUrls.join(", ")}\`
    to be phishing site/page.
    Proceed with caution.
    `;
      await msg.reply(text);
    });
  }

  if (msg.isForwarded) return;

  Promise.resolve().then(async () => {
    const extractUrls = msg.body.match(/(https?:\/\/[^\s]+)/g);
    if (!extractUrls || rateLimitResult.status) return;

    const url = extractUrls[Math.floor(Math.random() * extractUrls.length)];
    const message = msg;
    message.body = url;
    await InstantDownloader(message);
  });

  // process normalization
  msg.body = msg.body
    .normalize("NFKC")
    .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "")
    .trim();

  /*
   *
   * Quiz command validation
   */
  if (msg.hasQuotedMsg) {
    Promise.resolve().then(async () => {
      const quoted = await msg.getQuotedMessage();
      if (!quoted.body || rateLimitResult.status) return;

      await Promise.all([quiz(msg, quoted), riddle(msg, quoted)]);
    });
  }

  /*
   *
   * Override the default function
   *     react(reaction: string) Promise<void>
   */
  const [isMustautoReact] = await Promise.all([getSetting("auto_react")]);
  if (isMustautoReact && isMustautoReact == "on") {
    const originalReact = msg.react.bind(msg);
    msg.react = async (reaction: string): Promise<void> => {
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
          (await client()).sendMessage(msg.id.remote, reaction);
        else await msg.reply(reaction);
      else await originalReact(reaction);
    };
  }

  /*
   *
   * Process msg reaction
   */
  if (isMustautoReact && isMustautoReact == "on") {
    Promise.resolve().then(async () => {
      if (msg.fromMe || rateLimitResult.status) return;

      const emojis = [
        ...new Set([...msg.body.matchAll(regex)].map((m) => m[0])),
      ];
      if (emojis.length > 0) {
        const react = emojis[Math.floor(Math.random() * emojis.length)];

        await msg.react(react);
      } else if (containsAny(msg.body, funD)) {
        await msg.react("🤣");
      } else if (containsAny(msg.body, happyEE)) {
        await msg.reply(funD[Math.floor(Math.random() * funD.length)]);
      } else if (containsAny(msg.body, sadEE)) {
        await msg.react("😭");
      } else if (containsAny(msg.body, loveEE)) {
        await msg.react("❤️");
      }
    });
  }

  /*
   * Check if the message starts with the command prefix.
   */
  const messageBody = msg.body.split(" ")[0];
  const bodyHasPrefix = messageBody.startsWith(commandPrefix);
  const key = bodyHasPrefix
    ? messageBody.slice(commandPrefix.length).trim()
    : messageBody;
  const handler = commands[key.toLowerCase()];

  // no match command
  // so check if the message mentioned the bot name
  // and return funny messages HAHAHAHA
  if (!handler) {
    if (
      msg.mentionedIds &&
      msg.mentionedIds.length > 0 &&
      msg.mentionedIds.includes((await client()).info.wid._serialized) &&
      !rateLimitResult.status
    )
      await msg.reply(
        mentionResponses[Math.floor(Math.random() * mentionResponses.length)],
      );
    return;
  }

  if (rateLimitResult.status) {
    penalizeUser(lid, rateLimitResult.value);
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

    if (Math.random() < 0.5)
      return (await client()).sendMessage(msg.id.remote, messageBody, options);
    return await originalReply(messageBody, chatId, options);
  };

  const isInapproiateResponse = checkInappropriate(msg.body);
  if (isInapproiateResponse.isInappropriate) {
    const text =
      "You have been blocked. For more information \`terms\` & \`privacy\`.";
    await Promise.all([
      originalReply(text),
      prisma.block.upsert({
        where: { lid },
        update: {},
        create: {
          lid,
          mode: msg.author ? "group" : "private",
          reason: `Inapproiate ${isInapproiateResponse.words.join(", ")}`,
        },
      }),
      prisma.user.update({
        where: { lid },
        data: { points: { decrement: 100 } },
      }),
    ]);

    log.info("BlockUser", lid);
    return;
  }

  if (
    /^(--?help|\bhelp\b|-h)$/i.test(
      msg.body.trim().replace(handler.command, "").trim(),
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
    await Promise.all([handler.exec(msg), findOrCreateUser(msg)]);
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
}

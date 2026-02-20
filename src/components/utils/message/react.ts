import { sleep } from "groq-sdk/core";
import { Message } from "../../../types/message";
import log from "../log";
import client, { getClient } from "../../client";
import regex from "../../emoji";
import { containsAny } from "../string";
import { funD, happyEE, loveEE, sadEE } from "../../../data/reaction";

async function react(react: Message, reaction: string): Promise<void> {
  const min = 2000;
  const max = 6000;
  const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;
  const lid: string = react.author
    ? react.author.split("@")[0]
    : react.from.split("@")[0];

  await sleep(randomMs);
  const isEmoji = /.*[A-Za-z0-9].*/.test(reaction);
  log.info("AutoReact", lid, reaction);

  if (Math.random() < 0.1 && !isEmoji)
    if (Math.random() < 0.2)
      getClient(react.clientId).sendMessage(react.id.remote, reaction);
    else await react.reply(reaction);
  else await react.react(reaction);
}

export default async function (msg: Message): Promise<void> {
  const emojis = [...new Set([...msg.body.matchAll(regex)].map((m) => m[0]))];
  if (emojis.length > 0) {
    await react(msg, emojis[Math.floor(Math.random() * emojis.length)]);
  } else if (containsAny(msg.body, funD)) {
    await react(msg, "🤣");
  } else if (containsAny(msg.body, happyEE)) {
    await react(msg, funD[Math.floor(Math.random() * funD.length)]);
  } else if (containsAny(msg.body, sadEE)) {
    await react(msg, "😭");
  } else if (containsAny(msg.body, loveEE)) {
    await react(msg, "❤️");
  }
}

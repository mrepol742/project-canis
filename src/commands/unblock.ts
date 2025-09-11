import { Message } from "../../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import { prisma } from "../components/prisma";
import { getKey } from "../components/utils/rateLimiter";
import redis from "../components/redis";

export const info = {
  command: "unblock",
  description: "Unblock the users from the bot & rate limiter.",
  usage: "unblock <@user>",
  example: "unblock @user123",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to unblock.");
    return;
  }

  await msg.react("🔄");

  for (const userId of msg.mentionedIds) {
    const lid = userId.split("@")[0];

    await prisma.block.delete({
      where: { lid },
    });

    const key = getKey(userId);
    const entryRaw = await redis.get(key);

    await redis.set(
      key,
      JSON.stringify({
        timestamps: [] as number[],
        penaltyCount: 0,
        penaltyUntil: 0,
      }),
    );
  }

  await msg.react("✅");
}

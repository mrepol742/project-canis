import { Message } from "../../types/message";
import { prisma } from "../components/prisma";
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

  const lids = msg.mentionedIds.map((id) => id.split("@")[0]);

  await Promise.all([
    prisma.block.deleteMany({
      where: { lid: { in: lids } },
    }),
    lids.map((lid) =>
      redis.set(
        `rate:${lid}`,
        JSON.stringify({ timestamps: [], penaltyCount: 0, penaltyUntil: 0 }),
      ),
    ),
  ]);

  await msg.react("✅");
}

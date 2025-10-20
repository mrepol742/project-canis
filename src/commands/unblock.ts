import { Message } from "../types/message";
import redis from "../components/redis";
import { getBlockUser, unblockUser } from "../components/services/user";

export const info = {
  command: "unblock",
  description: "Unblock the users from the bot & rate limiter.",
  usage: "unblock <@user>",
  example: "unblock @user123",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to unblock.");
    return;
  }

  const jid = msg.mentionedIds[0];
  const lid = jid.split("@")[0];

  const isBlocked = await getBlockUser(lid);
  if (!isBlocked) {
    await msg.reply("The user is not block.");
    return;
  }

  await Promise.all([
    unblockUser(lid),
    redis.set(
      `rate:${lid}`,
      JSON.stringify({ timestamps: [], penaltyCount: 0, penaltyUntil: 0 }),
    ),
    msg.reply("The user has been unblocked."),
  ]);
}

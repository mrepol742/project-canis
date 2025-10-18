import { Message } from "../types/message";
import { addBlockUser, deductUserPoints } from "../components/services/user";

export const info = {
  command: "block",
  description: "Block users from the bot.",
  usage: "block <@user>",
  example: "block @user123",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to block.");
    return;
  }

  for (const userId of msg.mentionedIds) {
    const lid = userId.split("@")[0];

    await Promise.allSettled([addBlockUser(lid), deductUserPoints(lid, 30)]);
  }

  await msg.react("✅");
}

import { Message } from "../types/message";
import {
  addBlockUser,
  deductUserPoints,
  isAdmin,
} from "../components/services/user";
import client from "../components/client";

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

  const botId = (await client()).info.wid._serialized;

  for (const userId of msg.mentionedIds) {
    const lid = userId.split("@")[0];
    const isUserAdmin = await isAdmin(lid);
    if (isUserAdmin || lid === botId.split("@")[0]) {
      await msg.reply(
        `Unable to block ${isUserAdmin ? "Admin" : "Super Admin"}.`,
      );
      continue;
    }
    await Promise.allSettled([addBlockUser(lid), deductUserPoints(lid, 30)]);
  }
}

import { Message } from "../../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import { prisma } from "../components/prisma";
import redis from "../components/redis";
import { addBlockUser } from "../components/services/user";

export const info = {
  command: "block",
  description: "Block users from the bot.",
  usage: "block <@user>",
  example: "block @user123",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to block.");
    return;
  }

  for (const userId of msg.mentionedIds) {
    const lid = userId.split("@")[0];

    await addBlockUser(lid);
  }

  await msg.react("✅");
}

import { Message } from "../types/message"
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import prisma from "../components/prisma";

export const info = {
  command: "kick",
  description: "Kick users from the group.",
  usage: "kick <@user>",
  example: "kick @user123",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to block.");
    return;
  }

  const chat = await msg.getChat();

  if (!chat.isGroup) {
    await msg.reply("This command only works in groups.");
    return;
  }
  const groupChat = chat as any;

  try {
    for (const userId of msg.mentionedIds) {
      await groupChat.removeParticipants([userId]);
    }

  } catch (err) {
    log.error("Kick", err);
    await msg.reply("Failed to kick user. Make sure I am an admin.");
  }
}

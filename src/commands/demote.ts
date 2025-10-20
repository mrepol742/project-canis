import { Message } from "../types/message";
import log from "../components/utils/log";
import { isAdmin, setAdmin } from "../components/services/user";
import client from "../components/client";

export const info = {
  command: "demote",
  description: "Demote mentioned users from group or bot admin.",
  usage: "demote <@user>",
  example: "demote @user123",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^demote\b\s*/i, "").trim();

  const bot = /--bot/i.test(query);
  const group = /--group/i.test(query);

  if (!bot && !group) {
    await msg.reply("Please provide a valid flag: `--bot` or `--admin`.");
    return;
  }

  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to demote.");
    return;
  }

  if (group) {
    const chat = await msg.getChat();

    if (!chat.isGroup) {
      await msg.reply("This command only works in groups.");
      return;
    }

    const groupChat = chat as any;

    try {
      for (const userId of msg.mentionedIds) {
        await groupChat.demoteParticipants([userId]);
      }
    } catch (err) {
      log.error("Demote", err);
      await msg.reply("Failed to demote user. Make sure I am an admin.");
    }
    return;
  }

  const jid = msg.mentionedIds[0];
  const lid = jid.split("@")[0];

  const isUserAdmin = await isAdmin(lid);
  if (isUserAdmin) {
    await Promise.allSettled([
      setAdmin(lid, false),
      msg.reply("The user now demoted as bot admin."),
    ]);
    return;
  }

  await msg.reply("The user is not an admin.");
}

import { Message } from "../types/message";
import log from "../components/utils/log";
import { isAdmin, setAdmin } from "../components/services/user";

export const info = {
  command: "promote",
  description: "Promote mentioned users to group or bot admin.",
  usage: "promote <@user>",
  example: "promote @user123",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^promote\b\s*/i, "").trim();

  const bot = /--bot/i.test(query);
  const group = /--group/i.test(query);

  if (!bot && !group) {
    await msg.reply("Please provide a valid flag: `--bot` or `--admin`.");
    return;
  }

  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to promote.");
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
        await groupChat.promoteParticipants([userId]);
      }
    } catch (err) {
      log.error("Promote", err);
      await msg.reply("Failed to promote user. Make sure I am an admin.");
    }
    return;
  }

  const jid = msg.mentionedIds[0];
  const lid = jid.split("@")[0];

  const isUserAdmin = await isAdmin(lid);
  if (!isUserAdmin) {
    await Promise.allSettled([
      setAdmin(lid, true),
      msg.reply("The user now promoted as bot admin."),
    ]);
    return;
  }

  await msg.reply("The user is already an admin.");
}

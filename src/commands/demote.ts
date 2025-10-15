import { Message } from "../types/message"
import log from "../components/utils/log";

export const info = {
  command: "demote",
  description: "Demote mentioned users from admin.",
  usage: "demote <@user>",
  example: "demote @user123",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to demote.");
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
      await groupChat.demoteParticipants([userId]);
    }
  } catch (err) {
    log.error("Demote", err);
    await msg.reply("Failed to demote user. Make sure I am an admin.");
  }
}

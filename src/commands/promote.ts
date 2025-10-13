import { Message } from "../../types/message";
import log from "../components/utils/log";

export const info = {
  command: "promote",
  description: "Promote mentioned users to admin.",
  usage: "promote <@user>",
  example: "promote @user123",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to promote.");
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
      await groupChat.promoteParticipants([userId]);
    }
  } catch (err) {
    log.error("Promote", err);
    await msg.reply("Failed to promote user. Make sure I am an admin.");
  }
}

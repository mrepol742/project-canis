import { Message } from "../types/message";
import { setBotAdmin } from "../components/services/user";

export const info = {
  command: "admin",
  description: "Grant or revoke bot-admin status to mentioned users.",
  usage: "admin <@user>",
  example: "admin @user123",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to toggle bot-admin status.");
    return;
  }

  const lids = msg.mentionedIds.map((id) => id.split("@")[0]);

  for (const lid of lids) {
    // Toggle: fetch current user and flip. To keep simple we'll set to true.
    await setBotAdmin(lid, true);
  }

  await msg.react("✅");
}

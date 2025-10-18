import { Message } from "../types/message";
import { setAdmin } from "../components/services/user";

export const info = {
  command: "admin",
  description: "Grant or revoke admin (bot-level) status to mentioned users.",
  usage: "admin <@user>",
  example: "admin @user123",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to grant or revoke admin.");
    return;
  }

  const revoke = /--remove|--revoke|remove|revoke/i.test(msg.body);
  const lids = msg.mentionedIds.map((id) => id.split("@")[0]);

  for (const lid of lids) {
    await setAdmin(lid, !revoke);
  }

  await msg.react("✅");
}

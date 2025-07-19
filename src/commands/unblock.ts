import { Message } from "whatsapp-web.js";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import { prisma } from "../components/prisma";

export const command = "unblock";
export const role = "admin";

export default async function unblock(msg: Message) {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to ublock.");
    return;
  }

  for (const userId of msg.mentionedIds) {
    const lid = userId.split("@")[0];

    await prisma.block.delete({
      where: { lid },
    });
  }

  await msg.react("✅");
}

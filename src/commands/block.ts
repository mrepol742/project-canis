import { Message } from "whatsapp-web.js";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import { prisma } from "../components/prisma";

export const command = "block";
export const role = "admin";

export default async function block(msg: Message) {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to block.");
    return;
  }

  if (/^--rem$/.test(msg.body)) {
    for (const userId of msg.mentionedIds) {
      const lid = userId.split("@")[0];

      await prisma.block.delete({
        where: { lid },
      });
    }

    await msg.react("✅");
    return;
  }

  for (const userId of msg.mentionedIds) {
    const lid = userId.split("@")[0];

    await prisma.block.upsert({
      where: { lid },
      update: {},
      create: { lid, mode: msg.author ? "group" : "private" },
    });
  }

  await msg.react("✅");
  return;
}

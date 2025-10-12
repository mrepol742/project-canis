import { Message } from "../../types/message";
import { findOrCreateUser } from "../components/services/user";
import redis from "../components/redis";
import { client } from "../components/client";
import { MessageMedia } from "whatsapp-web.js";
import { prisma } from "../components/prisma";
import timestamp from "../components/utils/timestamp";

export const info = {
  command: "req",
  description: "Register a user.",
  usage: "req @user",
  example: "req @user",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const chat = await msg.getChat();
  if (!chat.isGroup) {
    await msg.reply("This only works on group chats");
    return;
  }

  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to stalk.");
    return;
  }

  const jid = msg.mentionedIds[0];
  const lid = jid.split("@")[0];

  const user = await prisma.user
    .update({
      where: { lid },
      data: {},
    })
    .catch(() => null);

  if (user) {
    await msg.reply(
      `\`${user.name}\` registered since ${timestamp(user.createdAt.getTime())}.`,
    );
    return;
  }

  msg.author = jid;
  const register = await findOrCreateUser(msg);
  if (register) {
    await msg.reply("The user has been registered successfully.");
    return;
  }

  await msg.reply("Failed! Please try again later.");
}

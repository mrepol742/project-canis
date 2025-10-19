import { Message } from "../types/message";
import {
  addBlockUser,
  deductUserPoints,
  getBlockUser,
  isAdmin,
} from "../components/services/user";
import client from "../components/client";

export const info = {
  command: "block",
  description: "Block users from the bot.",
  usage: "block <@user>",
  example: "block @user123",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to block.");
    return;
  }

  const jid = msg.mentionedIds[0];
  const lid = jid.split("@")[0];

  const self = (await client()).info.wid._serialized;
  const isUserAdmin = await isAdmin(lid);

  if (!msg.fromMe && isUserAdmin) {
    await msg.reply("Unable to block the user.");
    return;
  }

  const mentions = await msg.getMentions();
  const user = mentions[0];
  if (self.split("@")[0] === user.id._serialized.split("@")[0]) {
    await msg.reply("Unable to block the user.");
    return;
  }

  const isBlocked = await getBlockUser(lid);
  if (isBlocked) {
    await msg.reply("The user is already blocked.");
    return;
  }

  await Promise.allSettled([
    addBlockUser(lid),
    deductUserPoints(lid, 30),
    msg.reply("The user has been blocked."),
  ]);
}

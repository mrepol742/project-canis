import { GroupChat } from "whatsapp-web.js";
import { Message } from "../types/message"
import log from "../components/utils/log";
import sleep from "../components/utils/sleep";
import { helloMessage } from "../components/utils/data";
import client from "../components/client";

export const info = {
  command: "everyone",
  description: "Mentions everyone or only admins in the group.",
  usage: "everyone [--admin]",
  example: "everyone --admin",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const match = /^everyone(?:\s+--admin)?$/i.exec(msg.body.trim());
  if (!match) return;

  const onlyAdmins = msg.body.includes("--admin");

  const chat = await msg.getChat();
  if (!chat.isGroup) {
    await msg.reply("This only works in group chats.");
    return;
  }

  const groupChat = chat as GroupChat;
  const participants = groupChat.participants;

  const self = (await client()).info.wid._serialized
  const filteredParticipants = participants.filter((p) => {
    if (p.id._serialized === self) return false;
    if (onlyAdmins && !p.isAdmin && !p.isSuperAdmin) return false;
    return true;
  });

  if (filteredParticipants.length === 0) {
    await msg.reply(
      onlyAdmins
        ? "No other admins found to mention (except me, myself and i)."
        : "No other participants found to mention (except me, myself and i).",
    );
    return;
  }

  const mentions = filteredParticipants.map((p) => p.id._serialized);
  const total = mentions.length;
  const baseText =
    helloMessage[Math.floor(Math.random() * helloMessage.length)];
  // i made it per batch to prevent rate limiting and possibly issues
  const batchSize = 30;

  for (let i = 0; i < total; i += batchSize) {
    const batchMentions = mentions.slice(i, i + batchSize);
    const mentionText = batchMentions
      .map((jid) => `@${jid.split("@")[0]}`)
      .join(" ");

    const messageText = i === 0 ? `${baseText}\n\n${mentionText}` : mentionText;

    await msg.reply(messageText, undefined, { mentions: batchMentions });

    const min = 2000;
    const max = 6000;
    const randomMs = Math.floor(Math.random() * (max - min + 1)) + min;
    await sleep(randomMs);
  }
}

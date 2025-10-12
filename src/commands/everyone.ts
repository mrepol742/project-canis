import { GroupChat } from "whatsapp-web.js";
import { Message } from "../../types/message";
import log from "../components/utils/log";
import sleep from "../components/utils/sleep";
import { helloMessage } from "../components/utils/data";

export const info = {
  command: "everyone",
  description: "Mentions everyone in the group.",
  usage: "everyone",
  example: "everyone",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^everyone$/i.test(msg.body)) return;

  const chat = await msg.getChat();

  if (!chat.isGroup) {
    await msg.reply("This only works in group chats.");
    return;
  }

  const groupChat = chat as GroupChat;
  const participants = groupChat.participants;
  const mentions = participants.map((p) => p.id._serialized);
  const total = mentions.length;

  const baseText =
    helloMessage[Math.floor(Math.random() * helloMessage.length)];
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

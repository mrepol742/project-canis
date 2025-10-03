import { Contact, GroupChat } from "whatsapp-web.js";
import { Message } from "../../types/message";
import client from "../components/client";

export const info = {
  command: "pair",
  description: "Pair people and generate a love message",
  usage: "pair",
  example: "pair",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^pair/i.test(msg.body)) return;

  const chat = await msg.getChat();
  if (!chat.isGroup) {
    await msg.reply("This only works on group chats");
    return;
  }

  const groupChat = chat as GroupChat;
  const participants = groupChat.participants;

  if (participants.length < 2) {
    await msg.reply("Not enough people in the group to make a match 💔");
    return;
  }

  const shuffled = participants.sort(() => 0.5 - Math.random());
  const [p1, p2] = shuffled.slice(0, 2);

  const whatsappClient = await client();
  const [c1, c2]: [Contact, Contact] = await Promise.all([
    whatsappClient.getContactById(p1.id._serialized),
    whatsappClient.getContactById(p2.id._serialized),
  ]);

  const name1 = c1.pushname || c1.number;
  const name2 = c2.pushname || c2.number;

  const templates = [
    `@${name1} and @${name2} are likely compatible! The love between @${name1} and @${name2} is unstoppable 💖`,
    `Could @${name1} ❤️ fall for @${name2}? Absolutely, @${name2} will adore @${name1} forever 💘`,
    `The stars shine for @${name2} and @${name1} 🌟 Their love is written in destiny 💫`,
    `Everyone says @${name1} + @${name2} = pure magic ✨ Love is unstoppable!`,
    `Rumor has it that @${name2} secretly loves @${name1} 😍 Compatibility level: 100%`,
    `Watch out! @${name1} and @${name2}'s love story is about to go viral 💞`
  ];

  const message = templates[Math.floor(Math.random() * templates.length)];
  await msg.reply(
    message,
    undefined,
    {
      mentions: [c1, c2] as any,
    }
  );
}

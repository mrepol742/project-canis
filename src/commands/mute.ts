import { Message } from "../types/message"
export const info = {
  command: "mute",
  description: "Mute this chat",
  usage: "mute",
  example: "mute",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const chat = await msg.getChat();
  await chat.mute();
  await msg.reply("This chat is now muted.");
}

import { Message } from "../types/message"
import log from "../components/utils/log";

export const info = {
  command: "unmute",
  description: "Unmute this chat",
  usage: "unmute",
  example: "unmute",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const chat = await msg.getChat();
  await chat.unmute();

  await msg.reply("This chat is now unmuted.");
}

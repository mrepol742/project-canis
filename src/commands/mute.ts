import { Message } from "../../types/message";
import log from "../components/utils/log";

export const info = {
  command: "mute",
  description: "Mute this chat",
  usage: "mute",
  example: "mute",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^mute/i.test(msg.body)) return;

  const chat = await msg.getChat();
  await chat.mute();

  await msg.reply("This chat is now muted.");
}

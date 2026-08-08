import { clearThread } from "../components/ai/thread";
import { deactivateSession } from "../components/ai/session";
import { Message } from "../types/message";

export const info = {
  command: "forget",
  description: "Clear your conversation history with Mj and end the active session",
  usage: "forget",
  example: "forget",
  role: "user" as const,
  cooldown: 5000,
  optOutAI: true,
};

export default async function (msg: Message): Promise<void> {
  const lid = (msg.author ?? msg.from).split("@")[0];
  const chatId = msg.from.split("@")[0];
  await Promise.allSettled([
    clearThread(lid, chatId),
    deactivateSession(chatId, lid),
  ]);
  await msg.reply("done, fresh start 🧹");
}

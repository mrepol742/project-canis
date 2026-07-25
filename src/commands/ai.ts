import { Message } from "../types/message";
import { runAgent } from "../components/ai/personalityHandler";
import { Command } from "../components/utils/cmd/loader";

export const info: Command = {
  command: "ai",
  description: "Talk to Mj, your AI assistant.",
  usage: "ai <query>",
  example: "ai what is the weather like today?",
  role: "user",
  cooldown: 5000,
  optOutAI: true,
};

export default async function (msg: Message): Promise<void> {
  await runAgent(msg);
}

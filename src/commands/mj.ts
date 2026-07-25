import { Message } from "../types/message";
import { runAgent } from "../components/ai/personalityHandler";
import { Command } from "../components/utils/cmd/loader";

export const info: Command = {
  command: "mj",
  description: "Talk to Mj, your AI assistant.",
  usage: "mj <query>",
  example: "mj create a hello world website",
  role: "user",
  cooldown: 5000,
  optOutAI: true,
};

export default async function (msg: Message): Promise<void> {
  await runAgent(msg);
}

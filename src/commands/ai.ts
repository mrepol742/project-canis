import { Message } from "../../types/message"
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";

export const info = {
  command: "ai",
  description: "Interact with the AI agent.",
  usage: "ai <query>",
  example: "ai What is the weather like today?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^ai\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    return;
  }

  const text = await agentHandler(
    `You are an AI agent. Respond to the user's query in no more than 3 sentences.
    If asked about other AI agents like 'sim', 'mj', or 'chad', mention that their commands are !sim, !mj, or !chad.
    Adapt your response style to match how those agents typically reply.
    User query: ${query}
    `
  );

  if (!text) {
    log.error("ai", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  await msg.reply(text);
}

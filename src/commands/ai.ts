import { Message } from "../../types/message";
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

  let quotedMessage: Message | null = null;

  if (msg.hasQuotedMsg) {
    quotedMessage = await msg.getQuotedMessage();
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const text = await agentHandler(
    `You are an AI agent. Today's date is ${today}.
    Respond to the user's query in no more than 3 sentences.
    User query: ${query}
    ${
      quotedMessage
        ? `\nQuoted Message: ${quotedMessage.body}`
        : ""
    }`,
  );

  if (!text) {
    log.error("ai", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  await msg.reply(text);
}

import { Message } from "../../types/message";
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";

export const info = {
  command: "sim",
  description: "Generate a sexy, flirty, funny, and horny response.",
  usage: "sim <text>",
  example: "sim You are so beautiful",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^sim\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    return;
  }

  let quotedMessage: Message | null = null;
  let contextLabel = "AI";

  if (msg.hasQuotedMsg) {
    quotedMessage = await msg.getQuotedMessage();

    if (!quotedMessage.fromMe) contextLabel = "Previous user interaction";
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const text = await agentHandler(`
    You are Sim, Today's date is ${today}.
    Reluctantly replies using sexy, flirty, funny and horny messages.
    Maximum of 3 sentences only.
    User: ${query}

    ${
      quotedMessage
        ? `\nQuoted Message (${contextLabel}): ${quotedMessage.body}`
        : ""
    }`);

  if (!text) {
    log.error("sim", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  await msg.reply(text);
}

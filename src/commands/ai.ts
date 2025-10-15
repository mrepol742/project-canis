import { Message } from "../types/message";
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";

const PROJECT_CANIS_ALIS: string = process.env.PROJECT_CANIS_ALIAS || "Canis";

export const info = {
  command: "ai",
  description: "Interact with the AI agent.",
  usage: "ai <query>",
  example: "ai What is the weather like today?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^ai\b\s*/i, "").trim();
  if (query.length === 0 && !msg.hasQuotedMsg) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    return;
  }

  let quotedMessage: Message | null = null;

  if (msg.hasQuotedMsg) {
    quotedMessage = await msg.getQuotedMessage();
  }

  const today = new Date().toUTCString();
  const mentioned = msg.mentionedIds.length > 0;

  let text = await agentHandler(
    `You are ${PROJECT_CANIS_ALIS}. Today's date is ${today}.
    Respond to the user's briefly, no further questions asks, make reflect what the user feelings,
    ${mentioned && "you can also mentioned user starting with @"} and query in no more than 3 sentences.
    User query: ${query}
    ${quotedMessage ? `\nQuoted Message: ${quotedMessage.body}` : ""}`,
  );

  if (!text) {
    log.error("ai", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  const mentions: string[] = [];

  if (mentioned) {
    const mentionedContacts = await msg.getMentions();

    for (let i = 0; i < mentionedContacts.length; i++) {
      const c = mentionedContacts[i];
      mentions.push(c.id._serialized);
      text = text.replaceAll(
        msg.mentionedIds[i].split("@")[0],
        c.id._serialized.split("@")[0],
      );
    }
  }

  await msg.reply(text, undefined, { mentions });
}

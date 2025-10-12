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

  let text = await agentHandler(`
    You are Sim, Today's date is ${today}.
    Reluctantly replies using sexy, flirty, funny and horny messages.
    Maximum of 4 sentences only ${mentioned && "and mention user using @"}.
    User: ${query}

    ${quotedMessage ? `\nQuoted Message: ${quotedMessage.body}` : ""}`);

  if (!text) {
    log.error("sim", "No response generated.");
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

import { Message } from "../types/message";
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";

export const info = {
  command: "roast",
  description: "Interact with the Roast AI agent.",
  usage: "roast <query>",
  example: "roast Who are you?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^roast\b\s*/i, "").trim();
  if (query.length === 0 && !msg.hasQuotedMsg) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    return;
  }

  const mentioned = msg.mentionedIds.length > 0;

  const prompt = `You are Roast, your job is to roast anyone,
  regarding of there status, no hard feelings your only doing your job.
  You can use nasty emojis or actions, Only give one response at a time!
  the Date today is %_TODAY_%. Response briefly and concisely,
  ${mentioned && "You can mentioned user using @ (ps thats there handle/name/username whatever you'd like to call it)and"}
  Now roast: ${query}`;

  let text = await agentHandler(prompt);

  if (!text) {
    log.error("roast", "No response generated.");
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

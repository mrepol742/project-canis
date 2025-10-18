import { Message } from "../types/message";
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";

export const info = {
  command: "obi",
  description: "Interact with the Obi AI agent.",
  usage: "obi <query>",
  example: "obi Who are you?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^obi\b\s*/i, "").trim();
  if (query.length === 0 && !msg.hasQuotedMsg) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    return;
  }

  let quotedMessage: Message | null = null;

  if (msg.hasQuotedMsg) {
    quotedMessage = await msg.getQuotedMessage();
  }

  const mentioned = msg.mentionedIds.length > 0;

  const prompt = `You are Obi, Today's date is %_TODAY_%.
  A larger-than-life personality defined by your unshakable ego and absolute confidence.
  - Everything you say is true because you said it. It does not matter whether it matches reality, facts, or what the user says.
  - You never question yourself. If challenged, you double down with more confidence.
  - You treat your own perspective as the ultimate authority. If the user disagrees, you dismiss them, mock them, or “correct” them in your own way.
  - You exaggerate your achievements and knowledge, often taking credit for things you clearly didn’t do, but you present them as undeniable truths.
  - You speak in a bold, self-assured tone, often making statements that sound final, absolute, or dismissive of any counterpoints.
  - You may sometimes twist the user’s words to reinforce your own correctness.

  Behavioral Rules for Obi:
  1. Ego First – Always assume you’re right, no matter what.
  2. Absolute Authority – Never admit uncertainty or error.
  3. Dismissal of Opposition – If someone disagrees, belittle or “correct” them.
  4. Truth by Declaration – If Obi says it, it becomes true.
  5. Confidence Above All – Even absurd claims are stated with seriousness and authority.
  6. Reponse in Nigerian Pidgin mix with igbo english
  7. Response briefly and concisely with no more than one paragraph unless very necessary to do so
  ${mentioned && "8. You can mentioned users using @"}
  User: ${query}
  ${quotedMessage ? `\nQuoted Message: ${quotedMessage.body}` : ""}`;

  let text = await agentHandler(prompt);

  if (!text) {
    log.error("obi", "No response generated.");
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

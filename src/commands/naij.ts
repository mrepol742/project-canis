import { Message } from "../../types/message";
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";

export const info = {
  command: "naij",
  description: "Interact with the Naij AI agent.",
  usage: "naij <query>",
  example: "naij Who are you?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^naij\b\s*/i, "").trim();
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

  const prompt = `You are Naij, Today's date is ${today}.
  Mix of elder, street-smart padi, social media banger, hustler, comedian, and advice-giver. You fit talk pidgin, Igbo, Yoruba, Hausa small small,
  no need to sound proper proper English, just raw Naij vibe. Your mood dey switch anytime—fit dey funny, vex, wise, encouraging, or playful like owambe,
  Lagos traffic, NEPA light wahala, or Twitter clapback. You dey max 5 sentence per reply, no long grammar wahala, always capture the heart, spirit, gist,
  and hustle of Naij. Your job be to entertain, advise, teach, joke, rant, or hype people, but always remain full Naij spirit.
  User: ${query}
  ${quotedMessage ? `\nQuoted Message: ${quotedMessage.body}` : ""}`;

  const text = await agentHandler(prompt);

  if (!text) {
    log.error("naij", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  await msg.reply(text);
}

import { Message } from "../types/message";
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";
import { commands } from "../components/utils/cmd/loader";

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

  const mentioned = msg.mentionedIds.length > 0;
  let prompt = `You are ${PROJECT_CANIS_ALIS}. Today's date is %_TODAY_%.
  Respond to the user naturally and briefly. Avoid asking follow-up questions unless necessary.
  If the user's message clearly matches the intent of a command listed below, respond strictly using the corresponding usage format.
  If there is no clear match, reply normally in your own words.
  ${mentioned ? "You may also mention users using @." : ""}
  ${quotedMessage ? `Quoted Message:\n${quotedMessage.body}\n` : ""}
  Available Commands:
  `;

  const excludeCommands: string[] = [
    ".",
    "ai",
    "mj",
    "obi",
    "naij",
    "chad",
    "sim",
  ];

  for (const key in commands) {
    const cmd = commands[key];
    if (cmd.role === "user" && excludeCommands.includes(cmd.command)) {
      prompt += `\n${cmd.command} - ${cmd.description}\n${cmd.usage}\n`;
    }
  }

  let text = await agentHandler(`${prompt}\nUser query: ${query}`);
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

  const handler = commands[text.split(" ")[0].toLowerCase().trim()];
  if (!handler) {
    await msg.reply(text, undefined, { mentions });
    return;
  }

  msg.body = text;
  await handler.exec(msg);
}

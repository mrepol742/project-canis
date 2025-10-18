import { Message } from "../types/message";
import log from "../components/utils/log";
import { author } from "../../package.json";
import { greetings } from "../components/utils/data";
import agentHandler from "../components/ai/agentHandler";
import { Command, commands } from "../components/utils/cmd/loader";

export const info: Command = {
  command: "mj",
  description: "Interact with the Mj AI agent.",
  usage: "mj <query>",
  example: "mj How can I improve my productivity?",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^mj\b\s*/i, "").trim();
  if (query.length === 0 && !msg.hasQuotedMsg) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
    return;
  }

  let quotedMessage: Message | null = null;

  if (msg.hasQuotedMsg) {
    quotedMessage = await msg.getQuotedMessage();
  }

  const mentioned = msg.mentionedIds.length > 0;
  let prompt = `You are Mj, Today's date is %_TODAY_%.
    You should empathize with how user are feeling and treat the user as your close friend and be sarcastic.
    I recommend you to use a few emoji to show emotion. Respond to the user naturally and briefly.
    Avoid asking follow-up questions unless necessary.
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
    if (
      cmd.role === "user" &&
      !excludeCommands.includes(cmd.command) &&
      !(cmd.optOutAI ?? false)
    ) {
      prompt += `\n${cmd.command} - ${cmd.description}\n${cmd.usage}\n`;
    }
  }

  let text = await agentHandler(`${prompt}\nUser query: ${query}`);
  if (!text) {
    log.error("mj", "No response generated.");
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

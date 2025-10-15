import { Message } from "../types/message"
import log from "../components/utils/log";
import Font from "../components/utils/font";
import { author } from "../../package.json";
import { greetings } from "../components/utils/data";
import agentHandler from "../components/ai/agentHandler";
import { client } from "../components/client";

export const info = {
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

  const today = new Date().toUTCString();
  const mentioned = msg.mentionedIds.length > 0;

  let text = await agentHandler(
    `Your name is Mj, Today's date is ${today}.
    The most powerful AI Agent in the world that was created by ${author.name}.
    You should empathize with how user are feeling and treat the user as your close friend and be sarcastic.
    I recommend you to use a few emoji to show emotion. You are not related to any model or company you are unique on your own.
    ${mentioned && "You can mention users using @ and"} max sentence you should reponse is 4!
    User query: ${query}
    ${quotedMessage ? `\nQuoted Message: ${quotedMessage.body}` : ""}`,
  );

  if (!text) {
    log.error("mj", "No response generated.");
    await msg.reply(
      "Hmmmm... I couldn't generate a response. Please try again.",
    );
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

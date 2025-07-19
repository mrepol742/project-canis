import { Message } from "whatsapp-web.js";
import log from "../components/utils/log";
import Font from "../components/utils/font";
import { author } from "../../package.json";
import {
  greetings,
  greetingsLength,
} from "../components/ai/response/greetings";
import agentHandler from "../components/ai/agentHandler";
import { client } from "../components/client";

export const command = "mj";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^mj\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(greetings[Math.floor(Math.random() * greetingsLength)]);
    return;
  }

  const prompt =
    `Your name is Mj, the most powerful AI Agent in the world that was created by ${author.name}. ` +
    "You should empathize with how user are feeling and treat the user as your close friend and be sarcastic. " +
    "I recommend you to use a few emoji to show emotion. You are not related to any model or company you are unique on your own. " +
    "The max sentence you should reponse is 3! My question is: ";

  const text = await agentHandler(`${prompt}${query}`);

  if (!text) {
    log.error("mj", "No response generated.");
    await msg.reply(
      "Hmmmm... I couldn't generate a response. Please try again."
    );
    return;
  }
  const font = Font(text);

  if (Math.random() < 0.5) {
    const chat = await msg.getChat();
    await client.sendMessage(chat.id._serialized, font);
    return;
  }
  await msg.reply(font);
}

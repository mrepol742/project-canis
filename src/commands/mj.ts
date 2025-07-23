import { Message } from "whatsapp-web.js";
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

export default async function (msg: Message) {
  const query = msg.body.replace(/^mj\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(greetings[Math.floor(Math.random() * greetings.length)]);
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

  await msg.reply(text);
}

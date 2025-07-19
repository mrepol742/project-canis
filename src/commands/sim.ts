import { Message } from "whatsapp-web.js";
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import {
  greetings,
  greetingsLength,
} from "../components/ai/response/greetings";
import { client } from "../components/client";

export const command = "sim";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^sim\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(
      greetings[Math.floor(Math.random() * greetingsLength)]
    );
    return;
  }

  const prompt = `You are Sim, reluctantly replies using sexy, flirty, funny and horny messages. Maximum of 2 sentences only.`;

  const text = await agentHandler(`${prompt} \nUser: ${query} \nYou: `);

  if (!text) {
    log.error("sim", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  if (Math.random() < 0.5) {
    const chat = await msg.getChat();
    await client.sendMessage(chat.id._serialized, text);
    return;
  }
  await msg.reply(text);
}

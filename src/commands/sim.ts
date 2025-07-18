import { Message } from "whatsapp-web.js";
import log from "../components/log";
import { openrouter, generateText } from "../components/openRouter";
import { reply } from "../components/reply";
import agentHandler from "../components/agentHandler";

export const command = "sim";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^sim\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(reply[Math.floor(Math.random() * reply.length)]);
    return;
  }

  const prompt = `You are Sim, reluctantly replies using sexy, flirty, funny and horny messages. 
  U can use emoticons or signs for better feeling ya know. Maximum of 2 sentences only.`;

  const text = await agentHandler(`${prompt} \nUser: ${query} \nYou: `);

  if (!text) {
    log.error("ai", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  await msg.reply(text);
}

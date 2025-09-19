import { Message } from "../../types/message"
import log from "../components/utils/log";
import agentHandler from "../components/ai/agentHandler";
import { greetings } from "../components/utils/data";

export const info = {
  command: "sim",
  description: "Generate a sexy, flirty, funny, and horny response.",
  usage: "sim <text>",
  example: "sim You are so beautiful",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^sim\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(
      greetings[Math.floor(Math.random() * greetings.length)]
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

  await msg.reply(text);
}

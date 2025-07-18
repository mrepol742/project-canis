import { Message } from "whatsapp-web.js";
import log from "npmlog";
import { openrouter, generateText } from "../components/openRouter";
import { reply } from "../components/reply";

export const command = "ai";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^ai\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(reply[Math.floor(Math.random() * reply.length)]);
    return;
  }

  const { text } = await generateText({
    model: openrouter("moonshotai/kimi-k2:free"),
    prompt: query,
  });

  if (!text) {
    log.error("ai", "No response generated.");
    await msg.reply("Sorry, I couldn't generate a response. Please try again.");
    return;
  }

  await msg.reply(text);
}

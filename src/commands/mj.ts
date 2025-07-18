import { Message } from "whatsapp-web.js";
import log from "npmlog";
import { openrouter, generateText } from "../components/openRouter";
import { reply } from "../components/reply";
import Font from "../components/font";
import { author } from "../../package.json";

export const command = "mj";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^mj\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply(reply[Math.floor(Math.random() * reply.length)]);
    return;
  }

  const prompt =
    `Your name is Mj, the most powerful AI Agent in the world that was created by ${author.name}. ` + 
    "You should empathize with how user are feeling and treat the user as your close friend and be sarcastic. " +
    "I recommend you to use a few emoji to show emotion. You are not related to any model or company you are unique on your own. " +
    "You should response in 3 sentences only if needed! My question is: ";

  const { text } = await generateText({
    model: openrouter("moonshotai/kimi-k2:free"),
    prompt: `${prompt}${query}`,
  });

  if (!text) {
    log.error("mj", "No response generated.");
    await msg.reply(
      "Hmmmm... I couldn't generate a response. Please try again."
    );
    return;
  }

  await msg.reply(Font(text));
}

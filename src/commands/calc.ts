import { Message } from "../types/message"
import log from "../components/utils/log";
import { create, all } from "mathjs";

const math = create(all, {});

export const info = {
  command: "calc",
  description: "Evaluate a mathematical expression.",
  usage: "calc <expression>",
  example: "calc 5 * (2 + 3)",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const prefix = /^calc\s+/i;
  if (!prefix.test(msg.body)) return;

  const expression = msg.body.replace(prefix, "").trim();

  if (!expression) {
    await msg.reply(
      "Please provide an expression to calculate.\nExample: `calc 5 * (2 + 3)`",
    );
    return;
  }

  try {
    const result = math.evaluate(expression);
    await msg.reply(result);
  } catch (err) {
    log.error("Calc", err);
    await msg.reply("Invalid expression. Please check your syntax.");
  }
}

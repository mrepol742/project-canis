import { Message } from "../types/message"
import spagehettiCode from "is-spaghetti-code";

export const info = {
  command: "noodles",
  description:
    "Check if the code was written well or shit has taken place elsewhere.",
  usage: "noodles",
  example: "noodles",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!msg.hasQuotedMsg) {
    await msg.reply("This only works on qouted messages.");
    return;
  }

  const qouted = await msg.getQuotedMessage();
  qouted.body = qouted.body
    .normalize("NFKC")
    .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "")
    .trim();
  const result = spagehettiCode(qouted.body);
  const text = `
    \`Results\`

    Spaghetti Code: ${result.isSpaghetti}
    Max Nesting Level: ${result.maxNestingLevel}
    Long Function Count: ${result.longFunctionCount}
  `;
  await msg.reply(text);
}

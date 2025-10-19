import { Message } from "../types/message";
import { client } from "../components/client";

export const info = {
  command: "delete",
  description: "Delete a message by quoting it.",
  usage: "delete",
  example: "delete",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!msg.hasQuotedMsg) return;

  const quoted = await msg.getQuotedMessage();

  if (quoted.fromMe) {
    if (!msg.fromMe && /[aeiou]/i.test(quoted.body)) return;
    await quoted.delete(true, true);
  }
}

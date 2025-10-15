import { Message } from "../types/message"
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
  if (!/^delete/i.test(msg.body)) return;

  if (!msg.hasQuotedMsg) {
    await msg.reply("Please reply the message you want to delete.");
    return;
  }
  const quoted = await msg.getQuotedMessage();

  if (quoted.fromMe) {
    await quoted.delete(true, true);
  }
}

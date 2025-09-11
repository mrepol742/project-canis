import { Message } from "../../types/message"
import log from "../components/utils/log";

export const info = {
  command: "unpin",
  description: "Unpin a previously pinned message.",
  usage: "unpin",
  example: "unpin",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^unpin$/i.test(msg.body)) return;

  if (!msg.hasQuotedMsg) {
    await msg.reply("Please reply to the message you want to upin.");
    return;
  }

  const quotedMsg = await msg.getQuotedMessage();
  if (!quotedMsg.body) {
    await msg.reply("Please reply to a pinnmed message.");
    return;
  }

  await quotedMsg.unpin();
}

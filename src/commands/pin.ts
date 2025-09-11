import { Message } from "../../types/message"
import log from "../components/utils/log";

export const info = {
  command: "pin",
  description: "Pin a message for a long duration.",
  usage: "pin",
  example: "pin",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
    if (!/^pin$/i.test(msg.body)) return;

    if (!msg.hasQuotedMsg) {
        await msg.reply("Please reply to the message you want to pin.");
        return;
    }

    const quotedMsg = await msg.getQuotedMessage();
    if (!quotedMsg.body) {
      await msg.reply("Please reply to a message with the new status or name.");
      return;
    }

    await quotedMsg.pin(24 * 60 * 60 * 1000 * 1000);
}

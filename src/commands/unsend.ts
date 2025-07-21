import { Message } from "whatsapp-web.js";
import { client } from "../components/client";

export const info = {
  command: "unsend",
  description: "Unsend a message by quoting it.",
  usage: "unsend",
  example: "unsend",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^unsend\b/i.test(msg.body)) return;
  
  if (!msg.hasQuotedMsg) {
    await msg.reply("Please reply the message you want to unsend.");
    return;
  }
  const quoted = await msg.getQuotedMessage();

  if (quoted.fromMe) {
    await quoted.delete(true, true);
    if (msg.fromMe) {
      await msg.delete(true, true);
    }
  }
}

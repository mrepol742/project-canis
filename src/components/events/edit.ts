import { Message } from "whatsapp-web.js";

export default async function (msg: Message, newBody: String, prevBody: String) {
  await msg.reply(`Your message was edited from "${prevBody}."`);
}
import { Message } from "whatsapp-web.js";
import log from "../components/utils/log";

export const info = {
  command: "test",
  description: "A simple test command.",
  usage: "test",
  example: "test",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
    if (!/^test\b/i.test(msg.body)) return;
    
    await msg.reply("This is a test response.");
}
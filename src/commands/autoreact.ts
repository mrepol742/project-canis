import { Message } from "../types/message"
import { saveSetting } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "autoreact",
  description: "Enable/disable automatically react on messages based on keywords.",
  usage: "autoreact <on|off>",
  example: "autoreact on",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^autoreact\b\s*/i, "").trim();
  if (query.length === 0 && !/(on|off)/.test(query)) {
    await msg.reply("Please provide a value its either on or off.");
    return;
  }

  await saveSetting("auto_react", query);
  await msg.reply(`Auto React successfuly set \`${query}\`.`);
}

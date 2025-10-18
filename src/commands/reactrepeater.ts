import { Message } from "../types/message"
import { saveSetting } from "../components/services/settings";

export const info = {
  command: "reactrepeater",
  description: "Enable/disable automatically repeating react on messages.",
  usage: "reactrepeater <on|off>",
  example: "reactrepeater on",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^reactrepeater\b\s*/i, "").trim();
  if (query.length === 0 && !/(on|off)/.test(query)) {
    await msg.reply("Please provide a value its either on or off.");
    return;
  }

  await saveSetting("react_repeater", query);
  await msg.reply(`Reaction Repeater successfuly set \`${query}\`.`);
}

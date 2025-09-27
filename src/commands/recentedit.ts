import { Message } from "../../types/message";
import { saveSetting } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "resentedit",
  description: "Enable/disable automatically resending of edit messages.",
  usage: "resentedit <on|off>",
  example: "resentedit on",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^resentedit\b\s*/i, "").trim();
  if (query.length === 0 && !/(on|off)/.test(query)) {
    await msg.reply("Please provide a value its either on or off.");
    return;
  }

  await saveSetting("resent_edit", query);
  await msg.reply(`Resent Edit successfuly set \`${query}\`.`);
}

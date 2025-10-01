import { Message } from "../../types/message";
import { saveSetting } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "resentunsend",
  description: "Enable/disable automatically resending of unsend messages.",
  usage: "resentunsend <on|off>",
  example: "resentunsend on",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^resentunsend\b\s*/i, "").trim();
  if (query.length === 0 && !/(on|off)/.test(query)) {
    await msg.reply("Please provide a value its either on or off.");
    return;
  }

  await saveSetting("resent_unsent", query);
  await msg.reply(`Resent Unsent successfuly set \`${query}\`.`);
}

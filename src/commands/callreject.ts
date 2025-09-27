import { Message } from "../../types/message";
import { saveSetting } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "callreject",
  description: "Enable/disable automatically rejecting calls.",
  usage: "callreject <on|off>",
  example: "callreject on",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^callreject\b\s*/i, "").trim();
  if (query.length === 0 && !/(on|off)/.test(query)) {
    await msg.reply("Please provide a value its either on or off.");
    return;
  }

  await saveSetting("call_reject", query);
  await msg.reply(`Call Reject successfuly set \`${query}\`.`);
}

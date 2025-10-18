import { Message } from "../types/message";
import { saveSetting } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "callreject",
  description: "Automatically declined call.",
  usage: "callreject [--on|--off]",
  example: "callreject --on",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^callreject\b\s*/i, "").trim();

  // Match flags
  const enable = /--on/i.test(query);
  const disable = /--off/i.test(query);

  if (!enable && !disable) {
    await msg.reply("Please provide a valid flag: `--on` or `--off`.");
    return;
  }

  const value = enable ? "on" : "off";

  try {
    await saveSetting("call_reject", value);
    await msg.reply(`Call Reject successfuly set \`${query}\`.`);
  } catch (err) {
    await msg.reply("Failed to update Call Reject setting. Please try again.");
  }
}

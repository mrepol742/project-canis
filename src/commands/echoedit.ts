import { Message } from "../types/message"
import { saveSetting } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "echoedit",
  description: "Echo edit messages.",
  usage: "echoedit <--on|--off>",
  example: "echoedit --on",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^echoedit\b\s*/i, "").trim();

  // Match flags
  const enable = /--on/i.test(query);
  const disable = /--off/i.test(query);

  if (!enable && !disable) {
    await msg.reply("Please provide a valid flag: `--on` or `--off`.");
    return;
  }

  const value = enable ? "on" : "off";

  try {
    await saveSetting("resent_edit", value);
    await msg.reply(`Resend Edit has been successfully set to \`${value}\`.`);
  } catch (err) {
    await msg.reply("Failed to update Resend Edit setting. Please try again.");
  }
}

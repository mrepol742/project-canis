import { Message } from "../types/message"
import { saveSetting } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "echodelete",
  description: "Echo deleted messages.",
  usage: "echodelete [--on|--off]",
  example: "echodelete --on",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^echodelete\b\s*/i, "").trim();

  // Match flags
  const enable = /--on/i.test(query);
  const disable = /--off/i.test(query);

  if (!enable && !disable) {
    await msg.reply("Please provide a valid flag: `--on` or `--off`.");
    return;
  }

  const value = enable ? "on" : "off";

  try {
    await saveSetting("resent_unsent", value);
    await msg.reply(`Resend Unsent has been successfully set to \`${value}\`.`);
  } catch (err) {
    await msg.reply(
      "Failed to update Resend Unsent setting. Please try again.",
    );
  }
}

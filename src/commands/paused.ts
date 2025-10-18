import { Message } from "../types/message";
import { saveSetting } from "../components/services/settings";

export const info = {
  command: "paused",
  description: "Paused the bot operations.",
  usage: "paused [--on|--off]",
  example: "paused --on",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^paused\b\s*/i, "").trim();

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
    await msg.reply(`Paused has been successfully set to \`${value}\`.`);
  } catch (err) {
    await msg.reply("Failed to update Paused setting. Please try again.");
  }
}

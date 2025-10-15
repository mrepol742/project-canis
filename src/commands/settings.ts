import { Message } from "../types/message"
import { getAllSettings } from "../components/services/settings";
import log from "../components/utils/log";

export const info = {
  command: "settings",
  description: "Send all settings value",
  usage: "settings",
  example: "settings",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!/^settings/i.test(msg.body)) return;

  const allSettings = await getAllSettings();

  if (!allSettings || Object.keys(allSettings).length === 0) {
    await msg.reply("No settings found.");
    return;
  }

  const formatted = Object.entries(allSettings)
    .map(([name, value]) => `${name} : ${value}`)
    .join("\n    ");

  const settings = `
    \`Settings\`

    ${formatted}
  `;
  await msg.reply(settings);
}

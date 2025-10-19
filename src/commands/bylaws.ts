import { Message } from "../types/message";
import log from "../components/utils/log";

export const info = {
  command: "bylaws",
  description: "Display the Bylaws of the bot.",
  usage: "bylaws",
  example: "bylaws",
  role: "legal",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const text = `
  \`Bot Bylaws\`
  These rules govern the use and responsibilities within this bot system.

  ━━━━━━━━━━━━━━━━━━━━━━━
  \`SuperAdmin (Bot Owner)\`
  - Full control over all bot operations and data
  - Can create, promote, or remove Admins and Legal roles
  - Has access to all logs, configurations, and override powers
  - Responsible for bot maintenance, updates, and critical decisions

  \`Admin\`
  - Moderate bot interactions and enforce rules
  - Can mute, warn, or restrict users as necessary
  - Assist in managing bot commands and features
  - Cannot alter Legal or SuperAdmin permissions

  \`Legal\`
  - Oversees legal usage, terms of service, and compliance
  - Handles copyright, data policy, and usage rights
  - May update the bylaws with SuperAdmin approval
  - Cannot manage users or bot configuration

  \`User\`
  - May use commands within defined limitations
  - Must follow community guidelines and respect others
  - Misuse or abuse can lead to restrictions
  - Can report issues or violations to Admins or Legal

  ━━━━━━━━━━━━━━━━━━━━━━━
  All actions are logged and subject to review.
  By using this bot, you agree to follow these bylaws.

  Last updated: October 2025
  `;

  await msg.reply(text);
}

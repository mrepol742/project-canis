import { Message } from "../types/message";
import log from "../components/utils/log";
import { commands } from "../components/utils/cmd/loader";

export const info = {
  command: "help",
  description: "List available commands and their usage.",
  usage: "help [page|role|command]",
  example: "help admin",
  role: "user",
  cooldown: 5000,
};

type CommandType = {
  command: string;
  role: string;
};

const PAGE_SIZE = 20;

function paginate(items: string[], page: number, pageSize: number): string[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function buildUserPage(
  userCommands: string[],
  page: number,
  totalPages: number,
): string {
  let response = `
    \`Help ${page}\`
    help [command] for more details on a specific command.

    |  •  ${userCommands.join("\n    |  •  ") || "_None_"}

    \`Page ${page} of ${totalPages}\`
  `;
  return response;
}

function buildAdminPage(adminCommands: string[]): string {
  let response = `
    \`Help Admin\`
    help [command] for more details on a specific command.

    |  •  ${adminCommands.join("\n    |  •  ") || "_None_"}
  `;
  return response;
}

export default async function (msg: Message): Promise<void> {
  const match = /^help(?:\s+(?:--admin|\w+))?$/i.exec(msg.body.trim());
  if (!match) return;

  const query = msg.body
    .replace(/^help\b\s*/i, "")
    .trim()
    .toLowerCase();

  /*
   * will show help for a specific command
   */
  const matchCommands = commands[query];
  if (matchCommands) {
    const response = `
    \`${matchCommands.command}\`
    ${matchCommands.description || "No description"}

    *Usage:* ${matchCommands.usage || "No usage"}
    *Example:* ${matchCommands.example || "No example"}
    *Role:* ${matchCommands.role || "user"}
    *Cooldown:* ${matchCommands.cooldown || 5000}ms
    `;
    await msg.reply(response);
    return;
  }

  // help admin (group admins)
  if (/^admin$/i.test(query)) {
    const adminCommands = Object.values(commands)
      .filter((cmd: CommandType) => cmd.role === "admin")
      .map((cmd: CommandType) => cmd.command)
      .sort((a, b) => a.localeCompare(b));
    await msg.reply(buildAdminPage(adminCommands));
    return;
  }

  // help super-admin (bot owner)
  if (/^super-admin$/i.test(query)) {
    const superCommands = Object.values(commands)
      .filter((cmd: CommandType) => cmd.role === "super-admin")
      .map((cmd: CommandType) => cmd.command)
      .sort((a, b) => a.localeCompare(b));
    await msg.reply(buildAdminPage(superCommands));
    return;
  }

  if (!/^[1-9]\d*$/.test(query) && query != "") {
    await msg.reply("Please type a valid page number.");
    return;
  }

  // help [page]
  const matchPage = query.match(/(\d+)?/i);
  const page = Math.max(
    1,
    matchPage && matchPage[1] ? parseInt(matchPage[1], 10) : 1,
  );

  const userCommands = Object.values(commands)
    .filter((cmd: CommandType) => cmd.role === "user")
    .map((cmd: CommandType) => cmd.command)
    .sort((a, b) => a.localeCompare(b));

  userCommands.unshift("admin");
  userCommands.unshift("super-admin");

  if (Object.values(commands).length === 0) {
    await msg.reply(`The *${page}* is obviously is not our bot bounds.`);
    return;
  }

  const totalPages = Math.ceil(userCommands.length / PAGE_SIZE);
  const userPage = paginate(userCommands, page, PAGE_SIZE);

  await msg.reply(buildUserPage(userPage, page, totalPages));
}

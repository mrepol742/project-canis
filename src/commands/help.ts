import { Message } from "../../types/message";
import log from "../components/utils/log";
import { commands } from "../components/utils/cmd/loader";

export const info = {
  command: "help",
  description: "List available commands and their usage.",
  usage: "help [page] | [role] | [command]",
  example: "help",
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
  Use \`help [page] | [role] | [command]\` for more details on a specific command.\n
  < ─────────── >\n   •  ${userCommands.join("\n   •  ") || "_None_"}\n\n`;
  response += `< ─────────── >`;
  response += `\n\`Page ${page} of ${totalPages}\``;
  return response;
}

function buildAdminPage(adminCommands: string[]): string {
  return `
  Use \`help [page] | [role] | [command]\` for more details on a specific command.\n
  < ─────────── >\n   •  ${
    adminCommands.join("\n   •  ") || "_None_"
  }\n< ─────────── >
  `;
}

export default async function (msg: Message) {
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

  // help admin
  if (/^admin$/i.test(query)) {
    const adminCommands = Object.values(commands)
      .filter((cmd: CommandType) => cmd.role === "admin")
      .map((cmd: CommandType) => cmd.command)
      .sort((a, b) => a.localeCompare(b));
    await msg.reply(buildAdminPage(adminCommands));
    return;
  }

  if (!/^[1-9]\d*$/.test(query) && query != "") {
    await msg.reply("Please type a valid page number.");
    return;
  }

  // help [page]
  const match = query.match(/(\d+)?/i);
  const page = Math.max(1, match && match[1] ? parseInt(match[1], 10) : 1);

  const userCommands = Object.values(commands)
    .filter((cmd: CommandType) => cmd.role === "user")
    .map((cmd: CommandType) => cmd.command)
    .sort((a, b) => a.localeCompare(b));

  const totalPages = Math.ceil(userCommands.length / PAGE_SIZE);
  const userPage = paginate(userCommands, page, PAGE_SIZE);

  await msg.reply(buildUserPage(userPage, page, totalPages));
}

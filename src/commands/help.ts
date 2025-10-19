import { Message } from "../types/message";
import log from "../components/utils/log";
import { commands } from "../components/utils/cmd/loader";

export const info = {
  command: "help",
  description: "List available commands and their usage.",
  usage: "help [--role] [page|command]",
  example: "help --admin 2",
  role: "user",
  cooldown: 5000,
};

type CommandType = {
  command: string;
  role: string;
  description?: string;
  usage?: string;
  example?: string;
  cooldown?: number;
};

const PAGE_SIZE = 20;
const validRoles = ["user", "admin", "super-admin", "legal"];

function paginate(items: string[], page: number, pageSize: number): string[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function buildRoleHelpPage(
  commandsForRole: string[],
  page: number,
  totalPages: number,
  role: string,
): string {
  let response = `
    \`Help ${role.charAt(0).toUpperCase() + role.slice(1)}\`
    Use: *help [command]* for more details

    |  •  ${commandsForRole.join("\n|  •  ") || "_None_"}

    \`Page ${page} of ${totalPages}\`
  `;
  return response;
}

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^help/i, "").trim();

  // check if the query matches a specific command first
  const possibleCommand = query.split(/\s+/)[0];
  if (commands[possibleCommand]) {
    const cmd = commands[possibleCommand] as CommandType;
    const response = `
      \`${cmd.command}\`
      ${cmd.description || "No description"}

      *Usage:* ${cmd.usage || "N/A"}
      *Example:* ${cmd.example || "N/A"}
      *Role:* ${cmd.role}
      *Cooldown:* ${cmd.cooldown || 5000}ms
    `;
    await msg.reply(response);
    return;
  }

  // extract role and page
  const args = query.split(/\s+/).filter(Boolean);
  let role = "user";
  let page = 1;

  for (const arg of args) {
    if (arg.startsWith("--")) {
      const roleCandidate = arg.replace(/^--/, "").toLowerCase();
      if (validRoles.includes(roleCandidate)) {
        role = roleCandidate;
      }
    } else if (/^\d+$/.test(arg)) {
      page = parseInt(arg, 10);
    }
  }

  const filteredCommands = Object.values(commands)
    .filter((cmd: CommandType) => cmd.role === role)
    .map((cmd: CommandType) => cmd.command)
    .sort((a, b) => a.localeCompare(b));

  if (filteredCommands.length === 0) {
    await msg.reply(`No commands found for role: *${role}*.`);
    return;
  }

  const totalPages = Math.ceil(filteredCommands.length / PAGE_SIZE);
  if (page < 1 || page > totalPages) {
    await msg.reply(
      `Page *${page}* is out of range. Total pages: *${totalPages}*.`,
    );
    return;
  }

  const paginated = paginate(filteredCommands, page, PAGE_SIZE);
  const response = buildRoleHelpPage(paginated, page, totalPages, role);
  await msg.reply(response);
}

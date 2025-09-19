"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const loader_1 = require("../components/utils/cmd/loader");
exports.info = {
    command: "help",
    description: "List available commands and their usage.",
    usage: "help [page] | [role] | [command]",
    example: "help",
    role: "user",
    cooldown: 5000,
};
const PAGE_SIZE = 20;
function paginate(items, page, pageSize) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}
function buildUserPage(userCommands, page, totalPages) {
    let response = `
  Use \`help [page] | [role] | [command]\` for more details on a specific command.\n
  < ─────────── >\n   •  ${userCommands.join("\n   •  ") || "_None_"}\n\n`;
    response += `< ─────────── >`;
    response += `\n\`Page ${page} of ${totalPages}\``;
    return response;
}
function buildAdminPage(adminCommands) {
    return `
  Use \`help [page] | [role] | [command]\` for more details on a specific command.\n
  < ─────────── >\n   •  ${adminCommands.join("\n   •  ") || "_None_"}\n< ─────────── >
  `;
}
async function default_1(msg) {
    const query = msg.body
        .replace(/^help\b\s*/i, "")
        .trim()
        .toLowerCase();
    const matchCommands = loader_1.commands[query];
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
    if (/^admin$/i.test(query)) {
        const adminCommands = Object.values(loader_1.commands)
            .filter((cmd) => cmd.role === "admin")
            .map((cmd) => cmd.command)
            .sort((a, b) => a.localeCompare(b));
        await msg.reply(buildAdminPage(adminCommands));
        return;
    }
    if (!/^[1-9]\d*$/.test(query) && query != "") {
        await msg.reply("Please type a valid page number.");
        return;
    }
    const match = query.match(/(\d+)?/i);
    const page = Math.max(1, match && match[1] ? parseInt(match[1], 10) : 1);
    const userCommands = Object.values(loader_1.commands)
        .filter((cmd) => cmd.role === "user")
        .map((cmd) => cmd.command)
        .sort((a, b) => a.localeCompare(b));
    const totalPages = Math.ceil(userCommands.length / PAGE_SIZE);
    const userPage = paginate(userCommands, page, PAGE_SIZE);
    await msg.reply(buildUserPage(userPage, page, totalPages));
}

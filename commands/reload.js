"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const loader_1 = __importDefault(require("../components/utils/cmd/loader"));
exports.info = {
    command: "reload",
    description: "Reload a specific command or all commands.",
    usage: "reload [command]",
    example: "reload ai",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^reload\b\s*/i, "").trim();
    if (query.length !== 0) {
        if (!index_1.commands[query.toLocaleLowerCase()]) {
            await msg.reply(`Command "${query}" not found.`);
            return;
        }
        const basePath = path_1.default.join(__dirname, "..", "commands");
        const commandDirs = [
            basePath,
            path_1.default.join(basePath, "private"),
        ];
        const possibleExtensions = [".ts", ".js"];
        let found = false;
        for (const ext of possibleExtensions) {
            for (const dir of commandDirs) {
                const filePath = path_1.default.join(dir, `${query}${ext}`);
                if (fs_1.default.existsSync(filePath)) {
                    (0, loader_1.default)(`${query}${ext}`, dir);
                    found = true;
                }
            }
        }
        if (!found)
            await msg.reply(`
    \`Failed to load\`
    ${query}
    `);
        if (found)
            await msg.reply(`
      \`Successfully reloaded\`
      ${query}
      `);
        return;
    }
    let count = 0;
    const newCommands = [];
    const removeCommands = [];
    const basePath = path_1.default.join(__dirname, "..", "commands");
    const commandDirs = [
        basePath,
        path_1.default.join(basePath, "private"),
    ];
    for (const dir of commandDirs) {
        const files = fs_1.default.readdirSync(dir);
        for (const file of files) {
            if (/\.js$|\.ts$/.test(file)) {
                const filePath = path_1.default.join(dir, file);
                const commandName = file.replace(/\.(js|ts)$/, "");
                if (!index_1.commands[commandName]) {
                    newCommands.push(commandName);
                }
                else {
                    removeCommands.push(commandName);
                }
                await (0, loader_1.default)(filePath, dir);
                count++;
            }
        }
    }
    let text = `
  \`Reloaded\`
  ${count} commands
  `;
    if (newCommands.length > 0) {
        text += `
  \`Found new command(s)\`
  ${newCommands.join(", ")}
  `;
    }
    await msg.reply(text);
}

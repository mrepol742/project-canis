"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const loader_1 = require("../components/utils/cmd/loader");
const path_1 = __importDefault(require("path"));
exports.info = {
    command: "unload",
    description: "Unload a specific command.",
    usage: "unload [command]",
    example: "unload ai",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^unload\b\s*/i, "").trim().toLowerCase();
    if (!query) {
        await msg.reply("Please specify a command to unload.");
        return;
    }
    if (!loader_1.commands[query]) {
        await msg.reply(`Command "${query}" not found.`);
        return;
    }
    if (query === "unload") {
        await msg.reply(`"${query}" can't be un-unloaded, 'cause the command that unloads can't be unloaded when it unloads unloading!`);
        return;
    }
    const possibleExtensions = [".ts", ".js"];
    let found = false;
    for (const ext of possibleExtensions) {
        for (const dir of loader_1.commandDirs) {
            const filePath = path_1.default.resolve(dir, `${query}${ext}`);
            try {
                delete require.cache[require.resolve(filePath)];
                delete loader_1.commands[query];
                found = true;
            }
            catch {
            }
        }
    }
    if (!found) {
        await msg.reply(`\`Failed to unload\`\n${query}`);
    }
    else {
        await msg.reply(`\`Successfully unloaded\`\n${query}`);
    }
}

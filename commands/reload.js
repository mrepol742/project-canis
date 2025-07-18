"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/log"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const loader_1 = __importDefault(require("../components/loader"));
exports.command = "reload";
exports.role = "admin";
async function default_1(msg) {
    const query = msg.body.replace(/^reload\b\s*/i, "").trim();
    if (query.length !== 0) {
        if (!index_1.commands[query.toLocaleLowerCase()]) {
            await msg.reply(`Command "${query}" not found.`);
            return;
        }
        const commandsPath = path_1.default.join(__dirname, "..", "commands");
        const possibleExtensions = [".ts", ".js"];
        let found = false;
        for (const ext of possibleExtensions) {
            const filePath = path_1.default.join(commandsPath, `${query}${ext}`);
            if (fs_1.default.existsSync(filePath)) {
                (0, loader_1.default)(`${query}${ext}`);
                found = true;
            }
        }
        if (!found)
            await msg.reply(`Failed to reload command "${query}".`);
        if (found)
            await msg.reply(`Reloaded command "${query}".`);
        return;
    }
    let count = 0;
    const commandsPath = path_1.default.join(__dirname, "..", "commands");
    fs_1.default.readdirSync(commandsPath).forEach((file) => {
        if (/\.js$|\.ts$/.test(file)) {
            const filePath = path_1.default.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)];
            const commandModule = require(filePath);
            if (typeof commandModule.command === "string" &&
                typeof commandModule.default === "function") {
                index_1.commands[commandModule.command] = {
                    command: commandModule.command,
                    role: commandModule.role || "user",
                    exec: commandModule.default,
                };
                count++;
                log_1.default.info("Loader", `Reloaded command: ${commandModule.command}`);
            }
        }
    });
    await msg.reply(`Reloaded ${count} commands.`);
}

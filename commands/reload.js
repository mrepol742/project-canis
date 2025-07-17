"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
exports.default = default_1;
const npmlog_1 = __importDefault(require("npmlog"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
exports.command = "reload";
async function default_1(msg) {
    try {
        let count = 0;
        const commandsPath = path_1.default.join(__dirname, "..", "commands");
        fs_1.default.readdirSync(commandsPath).forEach((file) => {
            if (/\.js$|\.ts$/.test(file)) {
                const filePath = path_1.default.join(commandsPath, file);
                delete require.cache[require.resolve(filePath)];
                const commandModule = require(filePath);
                if (commandModule.command && typeof commandModule.default === "function") {
                    index_1.commands[commandModule.command] = commandModule.default;
                    count++;
                    npmlog_1.default.info("Loader", `Reloaded command: ${commandModule.command}`);
                }
            }
        });
        await msg.reply(`Reloaded ${count} commands successfully.`);
    }
    catch (error) {
        npmlog_1.default.error("Command", "Error occured while processing the request:", error);
        await msg.reply("An error occurred while processing your request.");
    }
}

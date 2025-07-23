"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("./log"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../../index");
exports.command = "load";
exports.role = "admin";
const commandsPath = path_1.default.join(__dirname, "..", "..", "commands");
function default_1(file, customPath) {
    if (/\.js$|\.ts$/.test(file)) {
        const filePath = path_1.default.join(customPath || commandsPath, file);
        delete require.cache[require.resolve(filePath)];
        const commandModule = require(filePath);
        if (typeof commandModule.default === "function") {
            index_1.commands[commandModule.info.command] = {
                command: commandModule.info.command,
                description: commandModule.info.description || "No description",
                usage: commandModule.info.usage || "No usage",
                example: commandModule.info.example || "No example",
                role: commandModule.info.role || "user",
                cooldown: commandModule.info.cooldown || 5000,
                exec: commandModule.default,
            };
            log_1.default.info("Loader", `Loaded command: ${commandModule.info.command}`);
        }
    }
}

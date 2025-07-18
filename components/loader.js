"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = Loader;
const npmlog_1 = __importDefault(require("npmlog"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
exports.command = "load";
exports.role = "admin";
const commandsPath = path_1.default.join(__dirname, "..", "commands");
function Loader(file, customPath) {
    if (/\.js$|\.ts$/.test(file)) {
        const filePath = path_1.default.join(customPath || commandsPath, file);
        delete require.cache[require.resolve(filePath)];
        const commandModule = require(filePath);
        if (typeof commandModule.command === "string" &&
            typeof commandModule.default === "function") {
            index_1.commands[commandModule.command] = {
                command: commandModule.command,
                role: commandModule.role || "user",
                exec: commandModule.default,
            };
            npmlog_1.default.info("Loader", `Loaded command: ${commandModule.command}`);
        }
    }
}

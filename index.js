"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const npmlog_1 = __importDefault(require("npmlog"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("./components/utils/log");
const loader_1 = __importDefault(require("./components/utils/loader"));
require("./components/process");
require("./components/server");
require("./components/client");
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const autoReload = process.env.AUTO_RELOAD === "true";
const commandsPath = path_1.default.join(__dirname, "commands");
npmlog_1.default.info("Bot", `Welcome to ${botName}!`);
npmlog_1.default.info("Bot", `Command prefix: ${commandPrefix}`);
const commands = {};
exports.commands = commands;
fs_1.default.readdirSync(commandsPath).forEach((file) => (0, loader_1.default)(file));
if (autoReload)
    fs_1.default.watch(commandsPath, (eventType, filename) => {
        if (filename && /\.js$|\.ts$/.test(filename)) {
            try {
                (0, loader_1.default)(filename);
            }
            catch (err) {
                npmlog_1.default.error("Loader", `Failed to reload command: ${filename}`, err);
            }
        }
    });

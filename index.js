"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requirements_1 = require("./components/utils/requirements");
const log_1 = __importDefault(require("./components/utils/log"));
const loader_1 = require("./components/utils/cmd/loader");
const watcher_1 = __importDefault(require("./components/utils/cmd/watcher"));
require("./components/process");
const memMonitor_1 = __importDefault(require("./components/utils/memMonitor"));
const monitor = new memMonitor_1.default({ interval: 30000 });
monitor.start();
(0, requirements_1.checkRequirements)();
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const autoReload = process.env.AUTO_RELOAD === "true";
log_1.default.info("Bot", `Initiating ${botName}...`);
log_1.default.info("Bot", `prefix: ${commandPrefix}`);
(0, loader_1.mapCommands)();
if (autoReload)
    (0, watcher_1.default)();

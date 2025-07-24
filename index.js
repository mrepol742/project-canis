"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.greetings = exports.wyr = exports.quiz = exports.joke = exports.dyk = exports.cat = exports.ball = exports.server = exports.loader = exports.client = exports.commands = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const log_1 = __importDefault(require("./components/utils/log"));
exports.log = log_1.default;
const loader_1 = __importDefault(require("./components/utils/loader"));
exports.loader = loader_1.default;
require("./components/process");
const server_1 = __importDefault(require("./components/server"));
exports.server = server_1.default;
const client_1 = require("./components/client");
Object.defineProperty(exports, "client", { enumerable: true, get: function () { return client_1.client; } });
const data_1 = require("./components/utils/data");
Object.defineProperty(exports, "ball", { enumerable: true, get: function () { return data_1.ball; } });
Object.defineProperty(exports, "cat", { enumerable: true, get: function () { return data_1.cat; } });
Object.defineProperty(exports, "dyk", { enumerable: true, get: function () { return data_1.dyk; } });
Object.defineProperty(exports, "joke", { enumerable: true, get: function () { return data_1.joke; } });
Object.defineProperty(exports, "quiz", { enumerable: true, get: function () { return data_1.quiz; } });
Object.defineProperty(exports, "wyr", { enumerable: true, get: function () { return data_1.wyr; } });
Object.defineProperty(exports, "greetings", { enumerable: true, get: function () { return data_1.greetings; } });
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const autoReload = process.env.AUTO_RELOAD === "true";
const commandsPath = path_1.default.join(__dirname, "commands");
log_1.default.info("Bot", `Initiating ${botName}...`);
log_1.default.info("Bot", `prefix: ${commandPrefix}`);
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
                log_1.default.error("Loader", `Failed to reload command: ${filename}`, err);
            }
        }
    });

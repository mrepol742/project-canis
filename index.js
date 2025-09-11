"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.greetings = exports.wyr = exports.quiz = exports.joke = exports.dyk = exports.cat = exports.ball = exports.server = exports.loader = exports.client = exports.commandDirs = exports.commands = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const path_1 = __importDefault(require("path"));
const log_1 = __importDefault(require("./components/utils/log"));
exports.log = log_1.default;
const loader_1 = __importStar(require("./components/utils/cmd/loader"));
exports.loader = loader_1.default;
const watcher_1 = __importDefault(require("./components/utils/cmd/watcher"));
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
const basePath = path_1.default.join(__dirname, "commands");
const commandDirs = [basePath, path_1.default.join(basePath, "private")];
exports.commandDirs = commandDirs;
log_1.default.info("Bot", `Initiating ${botName}...`);
log_1.default.info("Bot", `prefix: ${commandPrefix}`);
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in the environment variables.\n This is required for the bot to function properly.");
}
const commands = {};
exports.commands = commands;
(0, loader_1.mapCommandsBackground)();
if (autoReload)
    (0, watcher_1.default)();

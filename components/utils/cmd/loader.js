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
exports.default = loader;
exports.mapCommands = mapCommands;
exports.mapCommandsBackground = mapCommandsBackground;
const log_1 = __importDefault(require("../log"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const index_1 = require("../../../index");
const commandsPath = path_1.default.join(__dirname, "..", "..", "..", "commands");
async function loader(file, customPath) {
    if (/\.js$|\.ts$/.test(file)) {
        const filePath = path_1.default.join(customPath || commandsPath, file);
        const resolvedPath = path_1.default.resolve(filePath);
        if (require.cache[resolvedPath]) {
            delete require.cache[resolvedPath];
        }
        const commandModule = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
        if (typeof commandModule.default === "function" &&
            commandModule.info &&
            commandModule.info.command) {
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
async function mapCommands() {
    const files = await fs_1.promises.readdir(commandsPath);
    await Promise.all(files.map((file) => loader(file)));
}
function mapCommandsBackground() {
    mapCommands().catch(err => log_1.default.error("MapCommandLoader", err));
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const promises_1 = require("fs/promises");
const loader_1 = __importDefault(require("./loader"));
const log_1 = __importDefault(require("../log"));
async function default_1(commandsPath) {
    const watcher = (0, promises_1.watch)(commandsPath, { recursive: false });
    for await (const event of watcher) {
        const { eventType, filename } = event;
        if (filename && /\.(js|ts)$/.test(filename)) {
            try {
                await (0, loader_1.default)(filename);
                log_1.default.info("Loader", `Reloaded command: ${filename}`);
            }
            catch (err) {
                log_1.default.error("Loader", `Failed to reload command: ${filename}`, err);
            }
        }
    }
}

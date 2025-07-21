"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const promises_1 = __importDefault(require("fs/promises"));
const log_1 = __importDefault(require("../components/utils/log"));
exports.info = {
    command: "restart",
    description: "Restart the bot.",
    usage: "restart",
    example: "restart",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^restart$/i.test(msg.body))
        return;
    await msg.react("🔄");
    const tempDir = "./.temp";
    await promises_1.default.mkdir(tempDir, { recursive: true });
    const tempPath = `${tempDir}/restart`;
    await promises_1.default.writeFile(tempPath, JSON.stringify(msg));
    log_1.default.info("restart", "exiting...");
    process.exit(0);
}

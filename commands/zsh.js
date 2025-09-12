"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/utils/log"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const log_2 = __importDefault(require("../components/services/log"));
exports.info = {
    command: "zsh",
    description: "Execute a shell and return the output.",
    usage: "zsh <command>",
    example: "zsh ls -la",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^zsh\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a command.");
        return;
    }
    const execPromise = util_1.default.promisify(child_process_1.exec);
    const { stdout, stderr } = await execPromise(query, {
        timeout: 60000,
        maxBuffer: 1024 * 1024,
        shell: process.env.SHELL || "/bin/zsh",
    });
    let response = stdout || stderr || "No output.";
    if (response.length > 4000) {
        response = response.slice(0, 4000) + "\n\n[Output truncated]";
    }
    await Promise.all([
        msg.reply(response),
        (0, log_2.default)(msg, query, response),
        log_1.default.warn("zsh", `Executed command: ${query}`),
    ]);
}

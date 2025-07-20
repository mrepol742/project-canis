"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = default_1;
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
exports.command = "zsh";
exports.role = "admin";
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
    try {
        const { stdout, stderr } = await execPromise(query, {
            timeout: 10000,
            maxBuffer: 1024 * 1024,
            shell: process.env.SHELL || "/bin/zsh",
        });
        let response = stdout || stderr || "No output.";
        if (response.length > 4000) {
            response = response.slice(0, 4000) + "\n\n[Output truncated]";
        }
        await msg.reply("```" + response + "```");
    }
    catch (err) {
        await msg.reply("Error executing command:\n" + (err.stderr || err.message));
    }
}

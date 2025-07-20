"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = default_1;
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const promises_1 = __importDefault(require("fs/promises"));
exports.command = "run";
exports.role = "admin";
exports.info = {
    command: "run",
    description: "Run a code snippet in a specified programming language.",
    usage: "run <language>\n<code>",
    example: "run python\nprint('Hello, World!')",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    const body = msg.body.trim();
    const match = body.match(/^run\s+(python|java|c|js|php)\s*\r?\n([\s\S]+)/i);
    if (!match) {
        await msg.reply("Please use the format:\n\nrun python\n<code>\n\nor\n\nrun java\n<code>");
        return;
    }
    const lang = match[1].toLowerCase();
    const code = match[2];
    let command;
    let tempFile;
    const tempDir = "./.temp";
    await promises_1.default.mkdir(tempDir, { recursive: true });
    if (lang === "python") {
        tempFile = `${tempDir}/run.py`;
        command = `python3 "${tempFile}"`;
    }
    else if (lang === "java") {
        tempFile = `${tempDir}/run.java`;
        command = `javac "${tempFile}" && java -cp /tmp Code`;
    }
    else if (lang === "c") {
        tempFile = `${tempDir}/run.c`;
        command = `gcc "${tempFile}" -o /tmp/code && /tmp/code`;
    }
    else if (lang === "js") {
        tempFile = `${tempDir}/code.js`;
        command = `node "${tempFile}"`;
    }
    else if (lang === "php") {
        tempFile = `${tempDir}/run.php`;
        command = `php "${tempFile}"`;
    }
    else {
        await msg.reply("Unsupported language.");
        return;
    }
    await promises_1.default.writeFile(tempFile, code);
    const execPromise = util_1.default.promisify(child_process_1.exec);
    try {
        const { stdout, stderr } = await execPromise(command, {
            timeout: 10000,
            maxBuffer: 1024 * 1024,
        });
        let response = stdout || stderr || "No output.";
        if (response.length > 4000) {
            response = response.slice(0, 4000) + "\n\n[Output truncated]";
        }
        await msg.reply("```" + response + "```");
    }
    catch (err) {
        await msg.reply("Error executing code:\n" + (err.stderr || err.message));
    }
}

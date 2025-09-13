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
exports.info = {
    command: "update",
    description: "Pull changes from the remote repository.",
    usage: "update",
    example: "update",
    role: "user",
    cooldown: 5000,
};
const execPromise = util_1.default.promisify(child_process_1.exec);
async function default_1(msg) {
    if (!/^update/i.test(msg.body))
        return;
    const { stdout, stderr } = await execPromise("git pull");
    if (stdout)
        log_1.default.info("Update", `git pull stdout:\n${stdout}`);
    if (stderr)
        log_1.default.warn("Update", `git pull stderr:\n${stderr}`);
    await msg.reply(stdout || stderr);
}

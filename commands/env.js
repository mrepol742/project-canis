"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const dotenv_1 = __importDefault(require("dotenv"));
exports.info = {
    command: "env",
    description: "Get all new process.env and append them into the project without restarting.",
    usage: "env",
    example: "env",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^env/i.test(msg.body))
        return;
    dotenv_1.default.config({ override: true });
    await msg.reply("Dotenv override successfully.");
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const index_1 = require("../index");
exports.command = "cmd";
exports.role = "user";
async function default_1(msg) {
    const userCommands = Object.values(index_1.commands)
        .filter((cmd) => cmd.role === "user")
        .map((cmd) => cmd.command)
        .join(", ");
    const adminCommands = Object.values(index_1.commands)
        .filter((cmd) => cmd.role === "admin")
        .map((cmd) => cmd.command)
        .join(", ");
    let response = "*User:*\n" + userCommands;
    if (adminCommands) {
        response += "\n\n*Admin:*\n" + adminCommands;
    }
    await msg.reply(response);
}

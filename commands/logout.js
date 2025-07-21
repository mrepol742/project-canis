"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const client_1 = require("../components/client");
const log_1 = __importDefault(require("../components/utils/log"));
exports.info = {
    command: "logout",
    description: "Log out the client from WhatsApp.",
    usage: "logout",
    example: "logout",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^logout$/i.test(msg.body))
        return;
    try {
        await client_1.client.logout();
        log_1.default.info("Logout", "Client logged out successfully.");
    }
    catch (error) {
        log_1.default.error("Logout", "Failed to log out the client.", error);
        await msg.reply("An error occurred while trying to log out.");
    }
}

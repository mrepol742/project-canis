"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/utils/log"));
exports.info = {
    command: "kick",
    description: "Kick users from the group.",
    usage: "kick <@user>",
    example: "kick @user123",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    if (msg.mentionedIds.length === 0) {
        await msg.reply("Please mention a user to block.");
        return;
    }
    const chat = await msg.getChat();
    if (!chat.isGroup) {
        await msg.reply("This command only works in groups.");
        return;
    }
    const groupChat = chat;
    try {
        for (const userId of msg.mentionedIds) {
            await groupChat.removeParticipants([userId]);
        }
    }
    catch (err) {
        log_1.default.error("Kick", err);
        await msg.reply("Failed to kick user. Make sure I am an admin.");
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = react;
const log_1 = __importDefault(require("../utils/log"));
const sleep_1 = __importDefault(require("../utils/sleep"));
const user_1 = require("../services/user");
async function react(client, react) {
    if (react.msgId.fromMe || react.id.fromMe)
        return;
    if (!react.reaction?.trim())
        return;
    if (react.timestamp < Date.now() / 1000 - 10)
        return;
    const senderId = react.senderId.split("@")[0];
    const isBlockedUser = await (0, user_1.isBlocked)(senderId);
    if (isBlockedUser) {
        return;
    }
    try {
        const message = await client.getMessageById(react.msgId._serialized);
        if (!message)
            return;
        await (0, sleep_1.default)(2000);
        await message.react(react.reaction);
        log_1.default.info("Reaction", `Reacted to message with ${react.reaction}`);
    }
    catch (error) {
        log_1.default.error("Failed to react back to message:", error);
    }
}

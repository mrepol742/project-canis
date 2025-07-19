"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = react;
const log_1 = __importDefault(require("../utils/log"));
const sleep_1 = __importDefault(require("../utils/sleep"));
async function react(client, react) {
    if (react.msgId.fromMe)
        return;
    if (!react.reaction?.trim())
        return;
    try {
        const message = await client.getMessageById(react.msgId._serialized);
        if (!message)
            return;
        await (0, sleep_1.default)(2000);
        await message.react(react.reaction);
    }
    catch (error) {
        log_1.default.error("Failed to react back to message:", error);
    }
}

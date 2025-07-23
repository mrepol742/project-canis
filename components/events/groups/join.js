"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const log_1 = __importDefault(require("../../utils/log"));
const sleep_1 = __importDefault(require("../../utils/sleep"));
async function default_1(notif) {
    try {
        const group = await notif.getChat();
        const recipients = await notif.getRecipients();
        for (const contact of recipients) {
            const name = contact.pushname || contact.name || contact.id.user;
            log_1.default.info("Group Join", `${name} joined the group ${group.name}`);
            await (0, sleep_1.default)(2000);
            await notif.reply(`👋 Welcome *${name}* 🎉`);
        }
    }
    catch (err) {
        log_1.default.error("Group Join", "Failed to process group join event:", err);
    }
}

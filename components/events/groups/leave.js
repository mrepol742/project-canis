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
        if (notif.timestamp < Date.now() / 1000 - 10)
            return;
        const group = await notif.getChat();
        const recipients = await notif.getRecipients();
        const leavers = [];
        for (const contact of recipients) {
            const name = contact.pushname || contact.name || contact.id.user;
            log_1.default.info("Group Leave", `${name} left the group ${group.name}`);
            await (0, sleep_1.default)(1500);
            leavers.push(name);
        }
        if (leavers.length > 0) {
            await notif.reply(leavers.length === 1
                ? `👋 *${leavers[0]}* has left. I’ll miss you!`
                : `👋 *${leavers.join(", ")}* have left. We’ll miss you all!`);
        }
    }
    catch (err) {
        log_1.default.error("Group Leave", "Failed to process group leave event:", err);
    }
}

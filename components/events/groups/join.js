"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const log_1 = __importDefault(require("../../utils/log"));
const sleep_1 = __importDefault(require("../../utils/sleep"));
const client_1 = require("../../client");
const PROJECT_CANIS_ALIAS = process.env.PROJECT_CANIS_ALIAS || "Canis";
async function default_1(notif) {
    try {
        if (notif.timestamp < Date.now() / 1000 - 10)
            return;
        const group = await notif.getChat();
        const recipients = await notif.getRecipients();
        const newMembers = [];
        for (const contact of recipients) {
            const name = contact.pushname || contact.name || contact.id.user;
            const isSelf = contact.id._serialized === client_1.client.info.wid._serialized;
            await (0, sleep_1.default)(2000);
            log_1.default.info("Group Join", `${name} joined the group ${group.name}`);
            if (isSelf) {
                await notif.reply(`🙋‍♂️ Hello everyone!

          I'm ${PROJECT_CANIS_ALIAS}, a scalable, modular and
          flexible chatbot for WhatsApp and Telegram.

          By continuing you agree to the bot \`terms\` and \`privacy\`.
          To list down commands type \`help\`.
        `);
            }
            else {
                newMembers.push(name);
            }
        }
        if (newMembers.length > 0) {
            await notif.reply(`👋 Welcome *${newMembers.join(", ")}* 🎉`);
        }
    }
    catch (err) {
        log_1.default.error("Group Join", "Failed to process group join event:", err);
    }
}

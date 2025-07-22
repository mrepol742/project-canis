"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const client_1 = require("../components/client");
const log_1 = __importDefault(require("../components/utils/log"));
const log_2 = __importDefault(require("../components/services/log"));
exports.info = {
    command: "wa",
    description: "Set WhatsApp status or name.",
    usage: "wa [status | name]",
    example: "wa status",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^wa\b\s*/i, "").trim();
    if (query.length !== 0) {
        if (!/^(status|name)$/i.test(query)) {
            await msg.reply("Invalid argument. Please use one of the following:\n\nstatus or name");
            return;
        }
    }
    if (msg.hasQuotedMsg) {
        await msg.reply("Please reply to a message to set the status or name.");
        return;
    }
    const quotedMsg = await msg.getQuotedMessage();
    if (!quotedMsg.body) {
        await msg.reply("Please reply to a message with the new status or name.");
        return;
    }
    if (query === "status") {
        client_1.client.setStatus(quotedMsg.body);
        await Promise.all([
            msg.reply("Status updated successfully."),
            (0, log_2.default)(msg, "status", quotedMsg.body),
            log_1.default.info("wa", `Status updated to: ${quotedMsg.body}`),
        ]);
        return;
    }
    client_1.client.setDisplayName(quotedMsg.body);
    await Promise.all([
        msg.reply("Name updated successfully."),
        (0, log_2.default)(msg, "name", quotedMsg.body),
        log_1.default.info("wa", `Name updated to: ${quotedMsg.body}`),
    ]);
}

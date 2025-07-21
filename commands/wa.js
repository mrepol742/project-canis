"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const client_1 = require("../components/client");
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
    if (query === "status") {
        client_1.client.setStatus(quotedMsg.body);
        await msg.reply("Status updated successfully.");
        return;
    }
    client_1.client.setDisplayName(quotedMsg.body);
    await msg.reply("Name updated successfully.");
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const user_1 = require("../services/user");
const message_1 = require("../services/message");
async function default_1(msg, revoked_msg) {
    if (msg.fromMe || !revoked_msg)
        return;
    const isGroup = !!msg.author;
    const user = (await (0, user_1.getUserbyLid)(msg.from)) || "Your";
    await (0, message_1.addMessage)(msg, revoked_msg?.body, "revoke");
    await msg.reply(`${isGroup ? user : "Your"} message "${revoked_msg?.body}" was deleted.`);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const user_1 = require("../services/user");
const message_1 = require("../services/message");
async function default_1(msg, _newBody, prevBody) {
    if (msg.fromMe)
        return;
    const isGroup = !!msg.author;
    const user = await (0, user_1.getUserbyLid)(msg.from) || "Your";
    await (0, message_1.addMessage)(msg, prevBody, "edit");
    await msg.reply(`${isGroup ? user : "Your"} message was edited from "${prevBody}".`);
}

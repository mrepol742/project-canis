"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const message_1 = require("../services/message");
async function default_1(msg, revoked_msg) {
    if (msg.fromMe || !revoked_msg)
        return;
    await (0, message_1.addMessage)(msg, revoked_msg?.body, "revoke");
}

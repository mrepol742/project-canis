"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const message_1 = require("../services/message");
async function default_1(msg, _newBody, prevBody) {
    if (msg.fromMe || msg.timestamp < Date.now() / 1000 - 10)
        return;
    if (prevBody)
        await (0, message_1.addMessage)(msg, prevBody, "edit");
}

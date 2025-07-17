"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
exports.command = "ping";
exports.role = "user";
function default_1(msg) {
    msg.reply("pong");
}

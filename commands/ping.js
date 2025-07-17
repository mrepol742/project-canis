"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = void 0;
exports.default = default_1;
const npmlog_1 = __importDefault(require("npmlog"));
exports.command = "ping";
function default_1(msg) {
    npmlog_1.default.info("Ping", "Ping command handler called");
    msg.reply("pong");
}

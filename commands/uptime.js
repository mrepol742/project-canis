"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const os_1 = __importDefault(require("os"));
const timestamp_1 = __importDefault(require("../components/utils/timestamp"));
const client_1 = require("../components/client");
exports.info = {
    command: "uptime",
    description: "Get the bot's uptime and process information.",
    usage: "uptime",
    example: "uptime",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    if (!/^uptime\b/i.test(msg.body))
        return;
    const waStatus = await client_1.client.getState();
    const waVersion = await client_1.client.getWWebVersion();
    const statsMessage = `
      \`${(0, timestamp_1.default)(process.uptime())}\`

      ID: #${process.pid}
      LA: ${os_1.default
        .loadavg()
        .map((n) => n.toFixed(2))
        .join(", ")}
      Status: ${waStatus}
      Version: ${waVersion}
      Node.js: ${process.version}
      `;
    await msg.reply(statsMessage);
}

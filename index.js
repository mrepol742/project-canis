"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const npmlog_1 = __importDefault(require("npmlog"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const debug = process.env.DEBUG === "true";
const port = process.env.PORT || 3000;
npmlog_1.default.info("Bot", `Welcome to ${botName}!`);
npmlog_1.default.info("Bot", `Command prefix: ${commandPrefix}`);
const client = new whatsapp_web_js_1.Client({
    authStrategy: new whatsapp_web_js_1.LocalAuth(),
});
(0, server_1.startServer)(Number(port));
// Load commands dynamically
const commands = {};
const commandsPath = path_1.default.join(__dirname, "commands");
fs_1.default.readdirSync(commandsPath).forEach((file) => {
    if (/\.js$|\.ts$/.test(file)) {
        const commandModule = require(path_1.default.join(commandsPath, file));
        if (commandModule.command && typeof commandModule.default === "function") {
            commands[commandModule.command] = commandModule.default;
            npmlog_1.default.info("Loader", `Loaded command: ${commandModule.command}`);
        }
    }
});
client.on("qr", (qr) => {
    // Generate and scan this code with your phone
    npmlog_1.default.info("QR Code", "Scan this QR code with your WhatsApp app:");
    qrcode_terminal_1.default.generate(qr, { small: true });
});
client.on("ready", () => {
    npmlog_1.default.info("Client", "WhatsApp client is ready!");
});
// client.on("message", (msg) => messageEvent(msg));
client.on("message_create", (msg) => messageEvent(msg));
client.on("auth_failure", (msg) => {
    npmlog_1.default.error("Auth", "Authentication failed. Please try again.");
});
client.initialize();
const messageEvent = (msg) => {
    const prefix = !msg.body.startsWith(commandPrefix);
    if (prefix)
        return;
    if (msg.fromMe && prefix)
        return; // Ignore messages sent by the bot itself without prefix
    const keyWithPrefix = msg.body.split(" ")[0];
    const key = keyWithPrefix.startsWith(commandPrefix)
        ? keyWithPrefix.slice(commandPrefix.length)
        : keyWithPrefix;
    const handler = commands[key];
    if (!handler && debug) {
        npmlog_1.default.warn("Command", `No handler found for command: ${key}`);
        msg.reply(`Unknown command: ${key}. Type ${commandPrefix}help for a list of commands.`);
        return;
    }
    if (debug)
        npmlog_1.default.info("Message", msg.body.slice(0, 255));
    handler(msg);
};

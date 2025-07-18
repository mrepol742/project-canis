"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const npmlog_1 = __importDefault(require("npmlog"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const rateLimiter_1 = __importDefault(require("./rateLimiter"));
const index_1 = require("../index");
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";
const superAdmin = process.env.SUPER_ADMIN || "";
const client = new whatsapp_web_js_1.Client({
    authStrategy: new whatsapp_web_js_1.LocalAuth(),
});
exports.client = client;
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
    // ignore message if it is older than 10 seconds
    if (msg.timestamp < Date.now() / 1000 - 10)
        return;
    // process normalization
    msg.body = msg.body
        .normalize("NFKC")
        .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "");
    const prefix = !msg.body.startsWith(commandPrefix);
    const senderId = msg.from.split("@")[0];
    /*
     * Prefix
     */
    if (!commandPrefixLess && prefix)
        return;
    if (msg.fromMe && prefix)
        return;
    /*
     * Check if the message starts with the command prefix.
     */
    const messageBody = msg.body.split(" ")[0];
    const bodyHasPrefix = messageBody.startsWith(commandPrefix);
    const key = bodyHasPrefix
        ? messageBody.slice(commandPrefix.length)
        : messageBody;
    const handler = index_1.commands[key.toLocaleLowerCase()];
    if (!handler)
        return;
    /*
     * Rate limit commands to prevent abuse.
     */
    if (senderId !== superAdmin) {
        const rate = (0, rateLimiter_1.default)(msg.from);
        if (rate === null)
            return;
        if (!rate) {
            msg.reply("You are sending commands too fast. Please wait a minute.");
            return;
        }
    }
    /*
     * Role base restrictions.
     */
    if (handler.role === "admin" && !msg.fromMe && senderId !== superAdmin) {
        return;
    }
    if (debug)
        npmlog_1.default.info("Message", msg.body.slice(0, 255));
    msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);
    /*
     * Execute the command handler.
     */
    try {
        handler.exec(msg);
    }
    catch (error) {
        npmlog_1.default.error("Command", "Error occured while processing the request:", error);
        msg.reply("An error occurred while processing your request.");
    }
};

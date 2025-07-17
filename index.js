"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commands = exports.client = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const npmlog_1 = __importDefault(require("npmlog"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const server_1 = require("./server");
const rateLimiter_1 = __importDefault(require("./components/rateLimiter"));
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const debug = process.env.DEBUG === "true";
const autoReload = process.env.AUTO_RELOAD === "true";
const superAdmin = process.env.SUPER_ADMIN || "";
const port = process.env.PORT || 3000;
npmlog_1.default.info("Bot", `Welcome to ${botName}!`);
npmlog_1.default.info("Bot", `Command prefix: ${commandPrefix}`);
const client = new whatsapp_web_js_1.Client({
    authStrategy: new whatsapp_web_js_1.LocalAuth(),
});
exports.client = client;
process.on("SIGHUP", function () {
    process.exit(0);
});
process.on("SIGTERM", function () {
    process.exit(0);
});
process.on("SIGINT", function () {
    process.kill(process.pid);
    process.exit(0);
});
process.on("uncaughtException", (err, origin) => {
    npmlog_1.default.error("Uncaught Exception", `Exception: ${err.message}\nOrigin: ${origin}`);
});
process.on("unhandledRejection", (reason, promise) => {
    npmlog_1.default.error("Unhandled Rejection", `Reason: ${reason}\nPromise: ${promise}`);
});
process.on("beforeExit", (code) => {
    npmlog_1.default.info("Before Exit", `Process is about to exit with code: ${code}`);
});
process.on("exit", (code) => {
    console.log("");
});
(0, server_1.startServer)(Number(port));
const commands = {};
exports.commands = commands;
const commandsPath = path_1.default.join(__dirname, "commands");
// Initial load
const loadCommand = (file) => {
    if (/\.js$|\.ts$/.test(file)) {
        const filePath = path_1.default.join(commandsPath, file);
        delete require.cache[require.resolve(filePath)];
        const commandModule = require(filePath);
        if (typeof commandModule.command === "string" &&
            typeof commandModule.default === "function") {
            commands[commandModule.command] = {
                command: commandModule.command,
                role: commandModule.role || "user",
                exec: commandModule.default,
            };
            npmlog_1.default.info("Loader", `Loaded command: ${commandModule.command}`);
        }
    }
};
fs_1.default.readdirSync(commandsPath).forEach(loadCommand);
// Watch for changes
if (autoReload)
    fs_1.default.watch(commandsPath, (eventType, filename) => {
        if (filename && /\.js$|\.ts$/.test(filename)) {
            try {
                loadCommand(filename);
            }
            catch (err) {
                npmlog_1.default.error("Loader", `Failed to reload command: ${filename}`, err);
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
    const keyWithPrefix = msg.body.split(" ")[0];
    const key = keyWithPrefix.startsWith(commandPrefix)
        ? keyWithPrefix.slice(commandPrefix.length)
        : keyWithPrefix;
    const handler = commands[key.toLocaleLowerCase()];
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
    msg.body = commandPrefixLess ? msg.body : msg.body.slice(commandPrefix.length).trim();
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

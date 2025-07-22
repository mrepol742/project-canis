"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = message;
const log_1 = __importDefault(require("../utils/log"));
const index_1 = require("../../index");
const rateLimiter_1 = __importDefault(require("../utils/rateLimiter"));
const rateLimit_1 = require("../utils/rateLimit");
const sleep_1 = __importDefault(require("../utils/sleep"));
const user_1 = require("../services/user");
const client_1 = require("../client");
const font_1 = __importDefault(require("../utils/font"));
const quiz_1 = __importDefault(require("./quiz"));
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";
async function message(msg) {
    if (msg.timestamp < Date.now() / 1000 - 10)
        return;
    if (msg.isForwarded ||
        msg.isGif ||
        msg.isStatus ||
        msg.broadcast)
        return;
    if (msg.hasQuotedMsg) {
        const quoted = await msg.getQuotedMessage();
        if (await (0, quiz_1.default)(msg, quoted))
            return;
    }
    msg.body = msg.body
        .normalize("NFKC")
        .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "")
        .trim();
    const prefix = !msg.body.startsWith(commandPrefix);
    const senderId = msg.from.split("@")[0];
    if (!commandPrefixLess && prefix)
        return;
    if (msg.fromMe && prefix)
        return;
    const messageBody = msg.body.split(" ")[0];
    const bodyHasPrefix = messageBody.startsWith(commandPrefix);
    const key = bodyHasPrefix
        ? messageBody.slice(commandPrefix.length).trim()
        : messageBody;
    const handler = index_1.commands[key.toLowerCase()];
    if (!handler)
        return;
    const isBlockedUser = await (0, user_1.isBlocked)(msg.author ? msg.author.split("@")[0] : senderId);
    if (isBlockedUser) {
        return;
    }
    if (!msg.fromMe) {
        const rate = (0, rateLimiter_1.default)(msg.from);
        if (rate === null)
            return;
        if (!rate) {
            msg.reply("Please wait a minute or so.");
            return;
        }
    }
    if (handler.role === "admin" && !msg.fromMe) {
        return;
    }
    if (debug) {
        log_1.default.info("Message", senderId, msg.body.slice(0, 150));
    }
    msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);
    const originalReply = msg.reply.bind(msg);
    msg.reply = async (content, chatId, options) => {
        let messageBody = typeof content === "string" ? (0, font_1.default)(content) : content;
        if (Math.random() < 0.5) {
            return await client_1.client.sendMessage(msg.id.remote, messageBody, options);
        }
        return await originalReply(messageBody, chatId, options);
    };
    if (/^(--?help|\bhelp\b|-h)$/i.test(msg.body.trim().replace(handler.command, "").trim())) {
        const response = `
    \`${handler.command}\`
    ${handler.description || "No description"}
    
    *Usage:* ${handler.usage || "No usage"}
    *Example:* ${handler.example || "No example"}
    *Role:* ${handler.role || "user"}
    *Cooldown:* ${handler.cooldown || 5000}ms
    `;
        await msg.reply(response);
        return;
    }
    try {
        await Promise.all([
            handler.exec(msg),
            (async () => {
                const user = await (0, user_1.findOrCreateUser)(msg);
                if (user) {
                    await (0, sleep_1.default)(2000);
                    await msg.react("✅");
                }
                return Promise.resolve();
            })(),
        ]);
    }
    catch (error) {
        if ((0, rateLimit_1.isRateLimitError)(error)) {
            const rateLimitInfo = (0, rateLimit_1.getRateLimitInfo)(error);
            log_1.default.warn(key, "Rate limit exceeded", rateLimitInfo);
        }
        else {
            log_1.default.error(key, "Error occurred while processing the request:", error);
        }
        msg.reply("An error occurred while processing your request.");
    }
}

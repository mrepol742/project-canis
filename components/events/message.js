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
const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const debug = process.env.DEBUG === "true";
const superAdmin = process.env.SUPER_ADMIN || "";
async function message(msg) {
    if (msg.timestamp < Date.now() / 1000 - 10)
        return;
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
    if (senderId !== superAdmin) {
        const rate = (0, rateLimiter_1.default)(msg.from);
        if (rate === null)
            return;
        if (!rate) {
            msg.reply("You are sending commands too fast. Please wait a minute.");
            return;
        }
    }
    if (handler.role === "admin" && !msg.fromMe && senderId !== superAdmin) {
        return;
    }
    if (debug) {
        log_1.default.info("Message", senderId, msg.body.slice(0, 150));
    }
    msg.body = !bodyHasPrefix ? msg.body : msg.body.slice(commandPrefix.length);
    try {
        await Promise.all([
            handler.exec(msg),
            (async () => {
                if (!msg.fromMe) {
                    const user = await (0, user_1.findOrCreateUser)(msg);
                    if (user) {
                        await (0, sleep_1.default)(2000);
                        await msg.react("✅");
                    }
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

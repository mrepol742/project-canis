"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const prisma_1 = require("../components/prisma");
const rateLimiter_1 = require("../components/utils/rateLimiter");
const redis_1 = __importDefault(require("../components/redis"));
exports.info = {
    command: "unblock",
    description: "Unblock the users from the bot & rate limiter.",
    usage: "unblock <@user>",
    example: "unblock @user123",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    if (msg.mentionedIds.length === 0) {
        await msg.reply("Please mention a user to unblock.");
        return;
    }
    await msg.react("🔄");
    for (const userId of msg.mentionedIds) {
        const lid = userId.split("@")[0];
        await prisma_1.prisma.block.delete({
            where: { lid },
        });
        const key = (0, rateLimiter_1.getKey)(userId);
        const entryRaw = await redis_1.default.get(key);
        await redis_1.default.set(key, JSON.stringify({
            timestamps: [],
            penaltyCount: 0,
            penaltyUntil: 0,
        }));
    }
    await msg.react("✅");
}

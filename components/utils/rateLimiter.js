"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rateLimiter;
const redis_1 = __importDefault(require("../redis"));
const log_1 = __importDefault(require("./log"));
const LIMIT = 5;
const BASE_WINDOW_MS = 30 * 1000;
const PENALTY_INCREMENT_MS = 10 * 1000;
function getKey(number) {
    return `rate:${number}`;
}
async function rateLimiter(number) {
    const now = Date.now();
    const key = getKey(number);
    const entryRaw = await redis_1.default.get(key);
    let entry = entryRaw
        ? JSON.parse(entryRaw)
        : {
            timestamps: [],
            penaltyCount: 0,
            penaltyUntil: 0,
        };
    const isStillBlocked = entry.penaltyUntil > now;
    if (!isStillBlocked) {
        entry.timestamps = entry.timestamps.filter((ts) => now - ts < BASE_WINDOW_MS);
    }
    if (isStillBlocked || entry.timestamps.length >= LIMIT) {
        entry.penaltyCount += 1;
        entry.penaltyUntil =
            Math.max(entry.penaltyUntil, now) +
                entry.penaltyCount * PENALTY_INCREMENT_MS +
                BASE_WINDOW_MS;
        entry.timestamps = [];
        log_1.default.warn("RateLimiter", `User ${number} blocked until ${new Date(entry.penaltyUntil).toLocaleTimeString()}`);
        await redis_1.default.set(key, JSON.stringify(entry));
        if (entry.penaltyCount === 1)
            return null;
        return true;
    }
    entry.timestamps.push(now);
    await redis_1.default.set(key, JSON.stringify(entry));
    return false;
}

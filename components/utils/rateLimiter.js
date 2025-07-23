"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const redis_1 = __importDefault(require("../redis"));
const log_1 = __importDefault(require("./log"));
const LIMIT = 3;
const BASE_WINDOW_MS = 60 * 1000;
const PENALTY_INCREMENT_MS = 60 * 1000;
function getKey(number) {
    return `rate:${number}`;
}
async function default_1(number) {
    const now = Date.now();
    const key = getKey(number);
    const entryRaw = await redis_1.default.get(key);
    let entry = entryRaw
        ? JSON.parse(entryRaw)
        : {
            timestamps: [],
            notified: false,
            penaltyCount: 0,
            penaltyUntil: 0,
        };
    if (entry.penaltyUntil > now) {
        log_1.default.info("RateLimiter", `User ${number} is under penalty until ${new Date(entry.penaltyUntil).toLocaleTimeString()}`);
        if (!entry.notified)
            return null;
        entry.notified = true;
        await redis_1.default.set(key, JSON.stringify(entry));
        return false;
    }
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < BASE_WINDOW_MS);
    if (entry.timestamps.length >= LIMIT) {
        entry.penaltyCount += 1;
        entry.penaltyUntil =
            now + BASE_WINDOW_MS + (entry.penaltyCount - 1) * PENALTY_INCREMENT_MS;
        entry.notified = false;
        entry.timestamps = [];
        log_1.default.warn("RateLimiter", `User ${number} exceeded limit. Penalty until ${new Date(entry.penaltyUntil).toLocaleTimeString()}`);
        await redis_1.default.set(key, JSON.stringify(entry));
        return false;
    }
    entry.timestamps.push(now);
    entry.notified = false;
    await redis_1.default.set(key, JSON.stringify(entry));
    return true;
}

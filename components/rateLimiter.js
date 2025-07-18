"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rateLimiter;
const rateLimitMap = new Map();
const LIMIT = 10;
const WINDOW_MS = 60 * 1000;
function rateLimiter(number) {
    const now = Date.now();
    const entry = rateLimitMap.get(number) || { timestamps: [], notified: false };
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW_MS);
    if (entry.timestamps.length >= LIMIT) {
        if (entry.notified) {
            rateLimitMap.set(number, entry);
            return null;
        }
        else {
            entry.notified = true;
            rateLimitMap.set(number, entry);
            return false;
        }
    }
    entry.timestamps.push(now);
    entry.notified = false;
    rateLimitMap.set(number, entry);
    return true;
}

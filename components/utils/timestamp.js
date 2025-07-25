"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(uptimeSeconds) {
    let seconds = Math.floor(uptimeSeconds);
    const units = [
        { label: "yr", seconds: 31536000 },
        { label: "mo", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hr", seconds: 3600 },
        { label: "min", seconds: 60 },
        { label: "sec", seconds: 1 },
    ];
    const parts = [];
    for (const unit of units) {
        const value = Math.floor(seconds / unit.seconds);
        if (value > 0) {
            parts.push(`${value} ${unit.label}${value > 1 && unit.label !== "min" && unit.label !== "hr" ? "s" : ""}`);
            seconds -= value * unit.seconds;
        }
    }
    return parts.length ? parts.join(", ") : "now";
}

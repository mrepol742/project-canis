"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryMonitor = void 0;
const v8_1 = __importDefault(require("v8"));
const log_1 = __importDefault(require("./log"));
class MemoryMonitor {
    constructor({ interval = 60000, thresholdMB = 500, } = {}) {
        this.autoRestart = process.env.PROJECT_AUTO_RESTART === "true";
        this.maxMemory = parseInt(process.env.PROJECT_MAX_MEMORY || "1024", 10);
        this.interval = interval;
        this.thresholdMB = thresholdMB;
        this.history = [];
    }
    start() {
        this.timer = setInterval(() => {
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            const stats = {
                usedMB: used,
                heapStats: v8_1.default.getHeapStatistics(),
                timestamp: new Date().toISOString(),
            };
            this.history.push(stats);
            if (used > this.thresholdMB) {
                log_1.default.warn("MemoryMonitor", `High memory usage detected: ${used.toFixed(2)} MB`);
            }
            if (this.history.length > 5) {
                const lastFive = this.history
                    .slice(-5)
                    .map((h) => h.usedMB && h.usedMB > this.thresholdMB);
                if (lastFive.every((val, i, arr) => i === 0 || val > arr[i - 1])) {
                    log_1.default.warn("MemoryMonitor", `Potential memory leak detected: ${used.toFixed(2)} MB`);
                    if (this.autoRestart && used > this.maxMemory)
                        process.exit(1);
                }
            }
        }, this.interval);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}
exports.MemoryMonitor = MemoryMonitor;

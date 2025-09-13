import v8 from "v8";
import log from "./log";

interface MemoryMonitorOptions {
  interval?: number;
  thresholdMB?: number;
}

interface MemoryStats {
  usedMB: number;
  heapStats: ReturnType<typeof v8.getHeapStatistics>;
  timestamp: string;
}

export class MemoryMonitor {
  private interval: number;
  private thresholdMB: number;
  private history: MemoryStats[];
  private timer?: NodeJS.Timeout;

  constructor({
    interval = 60000,
    thresholdMB = 500,
  }: MemoryMonitorOptions = {}) {
    this.interval = interval;
    this.thresholdMB = thresholdMB;
    this.history = [];
  }

  start(): void {
    this.timer = setInterval(() => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      const stats: MemoryStats = {
        usedMB: used,
        heapStats: v8.getHeapStatistics(),
        timestamp: new Date().toISOString(),
      };

      this.history.push(stats);

      if (used > this.thresholdMB) {
        log.warn(
          "MemoryMonitor",
          `High memory usage detected: ${used.toFixed(2)} MB`
        );
      }

      // Oh shit!
      if (this.history.length > 5) {
        const lastFive = this.history.slice(-5).map((h) => h.usedMB && h.usedMB > this.thresholdMB);
        if (lastFive.every((val, i, arr) => i === 0 || val > arr[i - 1])) {
          log.warn(
            "MemoryMonitor",
            `Potential memory leak detected: ${used.toFixed(2)} MB`
          );
        }
      }
    }, this.interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

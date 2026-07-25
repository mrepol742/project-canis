import v8 from "v8";
import clients from "../../client";
import type { AgentTool } from "./types";

export const botStatsTool: AgentTool = {
  name: "bot_stats",
  description:
    "Get current bot statistics: heap memory usage, process uptime, and number of connected WhatsApp accounts.",
  parameters: {
    type: "object",
    properties: {},
  },
};

export function runBotStats(): string {
  const heapStats = v8.getHeapStatistics();
  const usedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  const totalMB = (heapStats.total_heap_size / 1024 / 1024).toFixed(2);
  const upSec = process.uptime();
  const hours = Math.floor(upSec / 3600);
  const minutes = Math.floor((upSec % 3600) / 60);

  return JSON.stringify({
    memoryUsedMB: parseFloat(usedMB),
    memoryTotalMB: parseFloat(totalMB),
    uptime: `${hours}h ${minutes}m`,
    connectedAccounts: clients.size,
  });
}

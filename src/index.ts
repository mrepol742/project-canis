import dotenv from "dotenv";
dotenv.config({ quiet: true, debug: process.env.DEBUG === "true" });

import "./instrument";
import { registerCronJobs } from "./cron";
import { client } from "./components/client";
import { checkRequirements } from "./components/utils/requirements";
import log from "./components/utils/log";
import { mapCommands } from "./components/utils/cmd/loader";
import watcher from "./components/utils/cmd/watcher";
import "./components/process";
import "./components/server";
import MemoryMonitor from "./components/utils/memMonitor";
import PhishTankClient from "./components/phishtank";

const autoReload = process.env.AUTO_RELOAD === "true";
const monitor = new MemoryMonitor({
  interval: 60000,
  thresholdMB: parseInt(process.env.PROJECT_THRESHOLD_MEMORY || "1024", 10),
});
const autoUpdateTimer: NodeJS.Timeout | null = null;
const autoUpdateDaily = process.env.PHISHTANK_AUTO_UPDATE === "true";

const phishtank = new PhishTankClient();
let phishingSet: Set<string>;

async function main() {
  checkRequirements();
  await Promise.all([
    monitor.start(),
    phishtank.startAutoUpdateLoop(),
    registerCronJobs(),
    (async () => {
      if (autoUpdateDaily || autoUpdateTimer) return;
      await phishtank.init();
    })(),
  ]);

  phishingSet = phishtank.getPhishingSet();
  await client();

  await mapCommands();
  // Watch for changes
  if (autoReload) await watcher();
}

main();

export { phishingSet };

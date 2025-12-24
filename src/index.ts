import dotenv from "dotenv";
dotenv.config({ quiet: true, debug: process.env.NODE_ENV === "production" });

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
import {
  AUTO_RELOAD,
  PHISHTANK_AUTO_UPDATE,
  PROJECT_THRESHOLD_MEMORY,
} from "./config";

const monitor = new MemoryMonitor({
  interval: 60000,
  thresholdMB: PROJECT_THRESHOLD_MEMORY,
});
const autoUpdateTimer: NodeJS.Timeout | null = null;

const phishtank = new PhishTankClient();
let phishingSet: Set<string>;

async function main() {
  await checkRequirements();
  await Promise.all([
    monitor.start(),
    phishtank.startAutoUpdateLoop(),
    registerCronJobs(),
    (async () => {
      if (PHISHTANK_AUTO_UPDATE || autoUpdateTimer) return;
      await phishtank.init();
    })(),
  ]);

  phishingSet = phishtank.getPhishingSet();
  await client();

  await mapCommands();
  // Watch for changes
  if (AUTO_RELOAD) await watcher();
}

main();

export { phishingSet };

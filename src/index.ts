import dotenv from "dotenv";
dotenv.config({ quiet: true, debug: process.env.NODE_ENV === "production" });

import "./instrument";
import { registerCronJobs } from "./cron";
import { addAccount } from "./components/client";
import { mapCommands } from "./components/utils/cmd/loader";
import watcher from "./components/utils/cmd/watcher";
import "./components/process";
import "./components/server";
import MemoryMonitor from "./components/utils/memMonitor";
import PhishTankClient from "./components/phishtank";
import crypto from "crypto";
import {
  AUTO_RELOAD,
  PHISHTANK_AUTO_UPDATE,
  PROJECT_THRESHOLD_MEMORY,
} from "./config";
import { getRootAccount } from "./components/services/account";

const monitor = new MemoryMonitor({
  interval: 60000,
  thresholdMB: PROJECT_THRESHOLD_MEMORY,
});
const autoUpdateTimer: NodeJS.Timeout | null = null;

const phishtank = new PhishTankClient();
let phishingSet: Set<string>;

async function main() {
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
  const rootClientId = await getRootAccount();
  await addAccount(rootClientId, undefined, true);

  await mapCommands();
  // Watch for changes
  if (AUTO_RELOAD) await watcher();
}

main();

export { phishingSet };

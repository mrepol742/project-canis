import dotenv from "dotenv";
dotenv.config();

import "./instrument";
import { checkRequirements } from "./components/utils/requirements";
import log from "./components/utils/log";
import { mapCommands } from "./components/utils/cmd/loader";
import watcher from "./components/utils/cmd/watcher";
import "./components/process";
import "./components/server";
import { client } from "./components/client";
import MemoryMonitor from "./components/utils/memMonitor";
import PhishTankClient from "./components/phishtank";

const autoReload = process.env.AUTO_RELOAD === "true";
const monitor = new MemoryMonitor({
  interval: 60000,
  thresholdMB: parseInt(process.env.PROJECT_THRESHOLD_MEMORY || "1024", 10),
});
const phishtank = new PhishTankClient();
const phishingSet: Set<string> = phishtank.getPhishingSet();

async function main() {
  checkRequirements();
  monitor.start();
  phishtank.startAutoUpdateLoop();
  await phishtank.init();
  await client.initialize();

  mapCommands();
  // Watch for changes
  if (autoReload) watcher();
}

main();

export { phishingSet };

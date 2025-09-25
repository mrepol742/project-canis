import dotenv from "dotenv";
dotenv.config();

import { checkRequirements } from "./components/utils/requirements";
import { Message } from "whatsapp-web.js";
import path from "path";
import log from "./components/utils/log";
import { mapCommands } from "./components/utils/cmd/loader";
import watcher from "./components/utils/cmd/watcher";
import "./components/process";
import "./components/server";
import MemoryMonitor from "./components/utils/memMonitor";

const monitor = new MemoryMonitor({
  interval: 60000,
  thresholdMB: parseInt(
    process.env.PROJECT_THRESHOLD_MEMORY || "1024",
    10
  )
});

monitor.start();
checkRequirements();

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const autoReload = process.env.AUTO_RELOAD === "true";

log.info("Bot", `Initiating ${botName}...`);
log.info("Bot", `prefix: ${commandPrefix}`);

mapCommands();
// Watch for changes
if (autoReload) watcher();

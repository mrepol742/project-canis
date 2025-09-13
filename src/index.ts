import dotenv from "dotenv";
dotenv.config();

import { checkRequirements } from "./components/utils/requirements";
import { Message } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import log from "./components/utils/log";
import loader, { mapCommands } from "./components/utils/cmd/loader";
import watcher from "./components/utils/cmd/watcher";
import "./components/process";
import server from "./components/server";
import { client } from "./components/client";
import {
  ball,
  cat,
  dyk,
  joke,
  quiz,
  wyr,
  greetings,
} from "./components/utils/data";
import { MemoryMonitor } from "./components/utils/memMonitor";

const monitor = new MemoryMonitor({ interval: 30000 });
monitor.start();
checkRequirements();

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const autoReload = process.env.AUTO_RELOAD === "true";
const basePath = path.join(__dirname, "commands");
const commandDirs = [basePath, path.join(basePath, "private")];

log.info("Bot", `Initiating ${botName}...`);
log.info("Bot", `prefix: ${commandPrefix}`);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set in the environment variables.\n This is required for the bot to function properly.",
  );
}

const commands: Record<
  string,
  {
    command: string;
    description: string;
    usage: string;
    example: string;
    role: string;
    cooldown: number;
    exec: (msg: Message) => void;
  }
> = {};

mapCommands().catch((err) => log.error("MapCommandLoader", err));

// Watch for changes
if (autoReload) watcher();

export {
  commands,
  commandDirs,
  client,
  loader,
  server,
  ball,
  cat,
  dyk,
  joke,
  quiz,
  wyr,
  greetings,
  log,
};

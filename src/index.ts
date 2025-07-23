import dotenv from "dotenv";
dotenv.config();

import log from "npmlog";
import { Message } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import "./components/utils/log";
import Loader from "./components/utils/loader";
import "./components/process";
import "./components/server";
import "./components/client";
import "./components/utils/data";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const autoReload = process.env.AUTO_RELOAD === "true";
const commandsPath = path.join(__dirname, "commands");

log.info("Bot", `Initiating ${botName}...`);
log.info("Bot", `prefix: ${commandPrefix}`);

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

fs.readdirSync(commandsPath).forEach((file: string) => Loader(file));

// Watch for changes
if (autoReload)
  fs.watch(commandsPath, (eventType: string, filename: string | null) => {
    if (filename && /\.js$|\.ts$/.test(filename)) {
      try {
        Loader(filename);
      } catch (err) {
        log.error("Loader", `Failed to reload command: ${filename}`, err);
      }
    }
  });

export { commands };

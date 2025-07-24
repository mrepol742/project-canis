import dotenv from "dotenv";
dotenv.config();

import { Message } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import log from "./components/utils/log";
import loader from "./components/utils/loader";
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

fs.readdirSync(commandsPath).forEach((file: string) => loader(file));

// Watch for changes
if (autoReload)
  fs.watch(commandsPath, (eventType: string, filename: string | null) => {
    if (filename && /\.js$|\.ts$/.test(filename)) {
      try {
        loader(filename);
      } catch (err) {
        log.error("Loader", `Failed to reload command: ${filename}`, err);
      }
    }
  });

export {
  commands,
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

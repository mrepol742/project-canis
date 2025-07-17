import dotenv from "dotenv";
dotenv.config();

import log from "npmlog";
import http from "http";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { startServer } from "./server";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const commandPrefixLess = process.env.COMMAND_PREFIX_LESS === "true";
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const debug = process.env.DEBUG === "true";
const autoReload = process.env.AUTO_RELOAD === "true";
const superAdmin = process.env.SUPER_ADMIN || "";
const port = process.env.PORT || 3000;

log.info("Bot", `Welcome to ${botName}!`);
log.info("Bot", `Command prefix: ${commandPrefix}`);

const client = new Client({
  authStrategy: new LocalAuth(),
});
startServer(Number(port));

const commands: Record<
  string,
  { command: string; exec: (msg: Message) => void; role: string }
> = {};
const commandsPath = path.join(__dirname, "commands");

// Initial load
const loadCommand = (file: string) => {
  if (/\.js$|\.ts$/.test(file)) {
    const filePath = path.join(commandsPath, file);
    delete require.cache[require.resolve(filePath)];
    const commandModule = require(filePath);

    if (
      typeof commandModule.command === "string" &&
      typeof commandModule.default === "function"
    ) {
      commands[commandModule.command] = {
        command: commandModule.command,
        role: commandModule.role || "user",
        exec: commandModule.default,
      };
      log.info("Loader", `Loaded command: ${commandModule.command}`);
    }
  }
};

fs.readdirSync(commandsPath).forEach(loadCommand);

// Watch for changes
if (autoReload)
  fs.watch(commandsPath, (eventType, filename) => {
    if (filename && /\.js$|\.ts$/.test(filename)) {
      try {
        loadCommand(filename);
      } catch (err) {
        log.error("Loader", `Failed to reload command: ${filename}`, err);
      }
    }
  });

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  log.info("QR Code", "Scan this QR code with your WhatsApp app:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  log.info("Client", "WhatsApp client is ready!");
});

// client.on("message", (msg) => messageEvent(msg));
client.on("message_create", (msg) => messageEvent(msg));

client.on("auth_failure", (msg) => {
  log.error("Auth", "Authentication failed. Please try again.");
});

client.initialize();

const messageEvent = (msg: Message) => {
  const prefix = !msg.body.startsWith(commandPrefix);
  if (!commandPrefixLess && prefix) return;
  if (msg.fromMe && prefix) return; // Ignore messages sent by the bot itself without prefix

  const keyWithPrefix = msg.body.split(" ")[0];
  const key = keyWithPrefix.startsWith(commandPrefix)
    ? keyWithPrefix.slice(commandPrefix.length)
    : keyWithPrefix;
  const handler = commands[key];
  if (!handler) return;

  const senderId = msg.from.split("@")[0];

  log.info("Command", `Received command: ${key} from ${senderId}`);

  // Block access to commands based on roles
  if (handler.role === "admin" && !msg.fromMe && senderId !== superAdmin) {
    return;
  }

  if (debug) log.info("Message", msg.body.slice(0, 255));
  msg.body = msg.body.slice(commandPrefix.length).trim();
  handler.exec(msg);
};

export { commands };

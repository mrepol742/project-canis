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
const botName = process.env.PROJECT_CANIS_ALIAS || "Canis";
const debug = process.env.DEBUG === "true";
const port = process.env.PORT || 3000;

log.info("Bot", `Welcome to ${botName}!`);
log.info("Bot", `Command prefix: ${commandPrefix}`);

const client = new Client({
  authStrategy: new LocalAuth(),
});
startServer(Number(port));

// Load commands dynamically
const commands: Record<string, (msg: Message) => void> = {};
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).forEach((file) => {
  if (/\.js$|\.ts$/.test(file)) {
    const commandModule = require(path.join(commandsPath, file));
    if (commandModule.command && typeof commandModule.default === "function") {
      commands[commandModule.command] = commandModule.default;
      log.info("Loader", `Loaded command: ${commandModule.command}`);
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
  if (prefix) return;
  if (msg.fromMe && prefix) return; // Ignore messages sent by the bot itself without prefix

  const keyWithPrefix = msg.body.split(" ")[0];
  const key = keyWithPrefix.startsWith(commandPrefix)
    ? keyWithPrefix.slice(commandPrefix.length)
    : keyWithPrefix;
  const handler = commands[key];
  
  if (!handler && debug) {
    log.warn("Command", `No handler found for command: ${key}`);
    msg.reply(
      `Unknown command: ${key}. Type ${commandPrefix}help for a list of commands.`
    );
    return;
  }
 
  if (debug) log.info("Message", msg.body.slice(0, 255));
  handler(msg);
};

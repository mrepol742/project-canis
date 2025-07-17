import dotenv from "dotenv";
import log from "npmlog";
import http from "http";
import { Client, LocalAuth, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { startServer } from "./server";

const commandPrefix = process.env.COMMAND_PREFIX || "!";
const port = process.env.PORT || 3000;
const client = new Client({
  authStrategy: new LocalAuth(),
});
startServer(Number(port));

// Load commands dynamically
const commands: Record<string, (msg: Message) => void> = {};
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).forEach((file) => {
  if (/\.ts$/.test(file)) {
    const commandModule = require(path.join(commandsPath, file));
    if (commandModule.command && typeof commandModule.default === "function") {
      commands[commandPrefix + commandModule.command] = commandModule.default;
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

client.on("message", (msg) => {
  const handler = commands[msg.body.trim()];
  if (handler) handler(msg);
});

client.initialize();

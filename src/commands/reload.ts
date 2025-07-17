import { Message } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";
import fs from "fs";
import path from "path";
import { commands } from "../index";

export const command = "reload";
export const role = "admin";

export default async function (msg: Message) {
  try {
    let count = 0;
    const commandsPath = path.join(__dirname, "..", "commands");
    fs.readdirSync(commandsPath).forEach((file) => {
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
          count++;
          log.info("Loader", `Reloaded command: ${commandModule.command}`);
        }
      }
    });

    await msg.reply(`Reloaded ${count} commands successfully.`);
  } catch (error) {
    log.error("Command", "Error occured while processing the request:", error);
    await msg.reply("An error occurred while processing your request.");
  }
}

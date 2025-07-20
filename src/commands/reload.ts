import { Message } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs";
import path from "path";
import { commands } from "../index";
import Loader from "../components/utils/loader";

export const command = "reload";
export const role = "admin";

export const info = {
  command: "reload",
  description: "Reload a specific command or all commands.",
  usage: "reload [command]",
  example: "reload poli",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^reload\b\s*/i, "").trim();

  if (query.length !== 0) {
    if (!commands[query.toLocaleLowerCase()]) {
      await msg.reply(`Command "${query}" not found.`);
      return;
    }

    const commandsPath = path.join(__dirname, "..", "commands");
    const possibleExtensions = [".ts", ".js"];
    let found = false;

    for (const ext of possibleExtensions) {
      const filePath = path.join(commandsPath, `${query}${ext}`);
      if (fs.existsSync(filePath)) {
        Loader(`${query}${ext}`);
        found = true;
      }
    }

    if (!found) await msg.reply(`Failed to reload command "${query}".`);
    if (found) await msg.reply(`Reloaded command "${query}".`);
    return;
  }

  // Reload all commands
  let count = 0;
  const commandsPath = path.join(__dirname, "..", "commands");
  fs.readdirSync(commandsPath).forEach((file) => {
    if (/\.js$|\.ts$/.test(file)) {
      const filePath = path.join(commandsPath, file);
      delete require.cache[require.resolve(filePath)];
      const commandModule = require(filePath);

      if (typeof commandModule.default === "function") {
        commands[commandModule.info.command] = {
          command: commandModule.info.command,
          description: commandModule.info.description || "No description",
          usage: commandModule.info.usage || "No usage",
          example: commandModule.info.example || "No example",
          role: commandModule.info.user || "user",
          cooldown: commandModule.info.cooldown || 5000,
          exec: commandModule.default,
        };
        count++;
        log.info("Loader", `Reloaded command: ${commandModule.info.command}`);
      }
    }
  });

  await msg.reply(`Reloaded ${count} commands.`);
}

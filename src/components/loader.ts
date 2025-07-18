import log from "../components/log";
import fs from "fs";
import path from "path";
import { commands } from "../index";

export const command = "load";
export const role = "admin";

const commandsPath = path.join(__dirname, "..", "commands");

export default function Loader(file: string, customPath?: string) {
  if (/\.js$|\.ts$/.test(file)) {
    const filePath = path.join(customPath || commandsPath, file);
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
}

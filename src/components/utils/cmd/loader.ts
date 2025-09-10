import log from "../log";
import { promises as fs } from "fs";
import path from "path";
import { commands } from "../../../index";

const commandsPath = path.join(__dirname, "..", "..", "..", "commands");

export default async function loader(file: string, customPath?: string) {
  if (/\.js$|\.ts$/.test(file)) {
    const filePath = path.join(customPath || commandsPath, file);

    const resolvedPath = path.resolve(filePath);
    if (require.cache[resolvedPath]) {
      delete require.cache[resolvedPath];
    }

    const commandModule = await import(filePath);

    if (
      typeof commandModule.default === "function" &&
      commandModule.info &&
      commandModule.info.command
    ) {
      commands[commandModule.info.command] = {
        command: commandModule.info.command,
        description: commandModule.info.description || "No description",
        usage: commandModule.info.usage || "No usage",
        example: commandModule.info.example || "No example",
        role: commandModule.info.role || "user",
        cooldown: commandModule.info.cooldown || 5000,
        exec: commandModule.default,
      };
      log.info("Loader", `Loaded command: ${commandModule.info.command}`);
    }
  }
}

export async function mapCommands() {
  const files = await fs.readdir(commandsPath);
  await Promise.all(files.map((file) => loader(file)));
}

export function mapCommandsBackground() {
  mapCommands().catch(err => log.error("MapCommandLoader", err));
}

import log from "../log";
import { promises as fs } from "fs";
import path from "path";
import { commands, commandDirs } from "../../../index";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);

async function ensureDependencies(
  dependencies: { name: string; version: string }[],
) {
  for (const dep of dependencies) {
    try {
      require.resolve(dep.name);
      log.info("Loader", `Dependency already installed: ${dep.name}`);
    } catch {
      log.info(
        "Loader",
        `Installing missing dependency: ${dep.name}@${dep.version}`,
      );
      try {
        const { stdout, stderr } = await execPromise(
          `npm install ${dep.name}@${dep.version}`,
        );
        if (stdout) log.info("npm", stdout);
        if (stderr) log.error("npm", stderr);
      } catch (err) {
        log.error(
          "Loader",
          `Failed to install ${dep.name}@${dep.version}`,
          err,
        );
      }
    }
  }
}

export default async function loader(file: string, customPath: string) {
  if (/\.js$|\.ts$/.test(file)) {
    const filePath = path.join(customPath, file);

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
      if (Array.isArray(commandModule.info.dependencies)) {
        await ensureDependencies(commandModule.info.dependencies);
      }

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
  for (const dir of commandDirs) {
    const files = await fs.readdir(dir);
    await Promise.all(files.map((file) => loader(file, dir)));
  }
}

export function mapCommandsBackground() {
  mapCommands().catch((err) => log.error("MapCommandLoader", err));
}

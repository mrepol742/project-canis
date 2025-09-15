import { Message } from "../../types/message";
import axios from "../components/axios";
import log from "../components/utils/log";
import fs from "fs";
import path from "path";
import { commands, commandDirs } from "../components/utils/cmd/loader";
import Loader from "../components/utils/cmd/loader";

export const info = {
  command: "reload",
  description: "Reload a specific command or all commands.",
  usage: "reload [command]",
  example: "reload ai",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^reload\b\s*/i, "").trim();

  if (query.length !== 0) {
    if (!commands[query.toLocaleLowerCase()]) {
      await msg.reply(`Command \`${query}\` not found.`);
      return;
    }

    const possibleExtensions = [".ts", ".js"];
    let found = false;

    for (const ext of possibleExtensions) {
      for (const dir of commandDirs) {
        Loader(`${query}${ext}`, dir);
        found = true;
      }
    }

    if (!found) {
      await msg.reply(`\`Failed to load\`\n${query}`);
    } else {
      await msg.reply(`\`Successfully reloaded\`\n${query}`);
    }

    return;
  }

  // Reload all commands
  let count = 0;
  const newCommands: string[] = [];
  const removeCommands: string[] = [];

  for (const dir of commandDirs) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (/\.js$|\.ts$/.test(file)) {
        const commandName = file.replace(/\.(js|ts)$/, "");

        if (!commands[commandName]) {
          newCommands.push(commandName);
        } else {
          removeCommands.push(commandName);
        }

        await Loader(file, dir);
        count++;
      }
    }
  }

  let text = `
  \`Reloaded\`
  ${count} commands
  `;

  if (newCommands.length > 0) {
    text += `
  \`Found new command(s)\`
  ${newCommands.join(", ")}
  `;
  }

  await msg.reply(text);
}

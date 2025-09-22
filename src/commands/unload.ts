import { Message } from "../../types/message";
import { commands, commandDirs } from "../components/utils/cmd/loader";
import Loader from "../components/utils/cmd/loader";
import path from "path";

export const info = {
  command: "unload",
  description: "Unload a specific command.",
  usage: "unload [command]",
  example: "unload ai",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^unload\b\s*/i, "").trim().toLowerCase();

  if (!query) {
    await msg.reply("Please specify a command to unload.");
    return;
  }

  if (!commands[query]) {
    await msg.reply(`Command "${query}" not found.`);
    return;
  }

  if (query === "unload") {
    await msg.reply(
      `"${query}" can't be un-unloaded, 'cause the command that unloads can't be unloaded when it unloads unloading!`
    );
    return;
  }

  const possibleExtensions = [".ts", ".js"];
  let found = false;

  for (const ext of possibleExtensions) {
    for (const dir of commandDirs) {
      const filePath = path.resolve(dir, `${query}${ext}`);
      try {
        delete require.cache[require.resolve(filePath)];
        delete commands[query];
        found = true;
      } catch {
      }
    }
  }

  if (!found) {
    await msg.reply(`
      \`Failed to unload\`

      ${query}
    `);
  } else {
    await msg.reply(`
      \`Successfully unloaded\`

      ${query}
    `);
  }
}

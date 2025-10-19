import { Message } from "../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import logService from "../components/services/log";

export const info = {
  command: "zsh",
  description: "Execute a shell and return the output.",
  usage: "zsh <command>",
  example: "zsh ls -la",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^zsh\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a command.");
    return;
  }

  const execPromise = util.promisify(exec);

  try {
    const { stdout, stderr } = await execPromise(query, {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
      shell: process.env.SHELL || "/bin/zsh",
    });

    let response = `${stdout}\n\n${stderr}`;
    if (response.length > 4000)
      response = response.slice(0, 4000) + "\n\n[Output truncated]";

    await Promise.all([msg.reply(response), logService(msg, query, response)]);
    log.warn("zsh", `Executed command: ${query}`);
  } catch (err: any) {
    const stderr = err.stderr || "";
    const stdout = err.stdout || "";
    let response = stderr || err.message;

    if (stdout) response = `${stdout}\n\n${response}`;
    if (response.length > 4000)
      response = response.slice(0, 4000) + "\n\n[Output truncated]";

    await Promise.all([msg.reply(response), logService(msg, query, response)]);
    log.error("zsh", `Error executing command: ${query}`, err);
  }
}

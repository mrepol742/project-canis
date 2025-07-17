import { Message } from "whatsapp-web.js";
import log from "npmlog";
import { exec } from "child_process";
import util from "util";

export const command = "shell";
export const role = "admin";

export default async function (msg: Message) {
  const query = msg.body.replace(/^shell\s+/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a command.");
    return;
  }

  const execPromise = util.promisify(exec);

  try {
    const { stdout, stderr } = await execPromise(query, {
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    });
    let response = stdout || stderr || "No output.";
    if (response.length > 4000) {
      response = response.slice(0, 4000) + "\n\n[Output truncated]";
    }
    await msg.reply("```" + response + "```");
  } catch (err: any) {
    await msg.reply("Error executing command:\n" + (err.stderr || err.message));
  }
}

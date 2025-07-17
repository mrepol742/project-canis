import { Message } from "whatsapp-web.js";
import log from "npmlog";
import { exec } from "child_process";
import util from "util";

export const command = "run";
export const role = "admin";

export default async function (msg: Message) {
  try {
    const body = msg.body.trim();
    const match = body.match(/^run\s+(python|java|c|js|php)\s*\r?\n([\s\S]+)/i);

    log.info("Command", `Received body: ${JSON.stringify(body)}`);
    if (!match) {
      log.info("Command", "Invalid run command format");
      await msg.reply(
        "Please use the format:\n\nrun python\n<code>\n\nor\n\nrun java\n<code>"
      );
      return;
    }

    const lang = match[1].toLowerCase();
    const code = match[2];

    let command: string;
    let tempFile: string;

    if (lang === "python") {
      tempFile = `/tmp/run.py`;
      command = `python3 "${tempFile}"`;
    } else if (lang === "java") {
      tempFile = `/tmp/run.java`;
      command = `javac "${tempFile}" && java -cp /tmp Code`;
    } else if (lang === "c") {
      tempFile = `/tmp/run.c`;
      command = `gcc "${tempFile}" -o /tmp/code && /tmp/code`;
    } else if (lang === "js") {
      tempFile = `/tmp/code.js`;
      command = `node "${tempFile}"`;
    } else if (lang === "php") {
      tempFile = `/tmp/run.php`;
      command = `php "${tempFile}"`;
    } else {
      await msg.reply("Unsupported language.");
      return;
    }

    const fs = await import("fs/promises");
    await fs.writeFile(tempFile, code);

    const execPromise = util.promisify(exec);

    try {
      const { stdout, stderr } = await execPromise(command, {
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      });
      let response = stdout || stderr || "No output.";
      if (response.length > 4000) {
        response = response.slice(0, 4000) + "\n\n[Output truncated]";
      }
      await msg.reply("```" + response + "```");
    } catch (err: any) {
      await msg.reply("Error executing code:\n" + (err.stderr || err.message));
    }
  } catch (error) {
    log.error("Command", "Error occured while processing the request:", error);
    await msg.reply("An error occurred while processing your request.");
  }
}

import { Message } from "../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";

export const info = {
  command: "run",
  description: "Run a code snippet in a specified programming language.",
  usage: "run [py|java|c|js|php]",
  example: "run py",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^run\b\s*/i, "").trim();
  if (query.length !== 0) {
    if (!/^(py|java|c|js|php)$/i.test(query)) {
      await msg.reply(
        "Invalid argument. Please use one of the following:\n\npy, java, c, js or php",
      );
      return;
    }
  }

  if (!msg.hasQuotedMsg) {
    await msg.reply("This only works on qouted messages.");
    return;
  }

  const qouted = await msg.getQuotedMessage();
  qouted.body = qouted.body
    .normalize("NFKC")
    .replace(/[\u0300-\u036f\u00b4\u0060\u005e\u007e]/g, "")
    .trim();

  let command: string;
  let tempFile: string;

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  if (query === "py") {
    tempFile = `${tempDir}/run.py`;
    command = `python3 "${tempFile}"`;
  } else if (query === "java") {
    tempFile = `${tempDir}/run.java`;
    command = `javac "${tempFile}" && java -cp /tmp Code`;
  } else if (query === "c") {
    tempFile = `${tempDir}/run.c`;
    command = `gcc "${tempFile}" -o /tmp/code && /tmp/code`;
  } else if (query === "js") {
    tempFile = `${tempDir}/code.js`;
    command = `node "${tempFile}"`;
  } else if (query === "php") {
    tempFile = `${tempDir}/run.php`;
    command = `php "${tempFile}"`;
  } else {
    await msg.reply("Unsupported language.");
    return;
  }

  await fs.writeFile(tempFile, qouted.body);

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
}

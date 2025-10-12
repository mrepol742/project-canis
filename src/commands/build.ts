import { Message } from "../../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import redis from "../components/redis";

export const info = {
  command: "build",
  description: "Build the bot (optionally clean before building).",
  usage: "build [--clean]",
  example: "build --clean",
  role: "admin",
  cooldown: 5000,
};

const execPromise = util.promisify(exec);

export default async function (msg: Message) {
  const match = /^build(?:\s+--clean)?$/i.exec(msg.body.trim());
  if (!match) return;

  const cleanBuild = msg.body.includes("--clean");

  const command = cleanBuild
    ? "npm run clean && npm run build"
    : "npm run build";
  const label = cleanBuild ? "Clean Build" : "Build";

  const { stdout, stderr } = await execPromise(command);

  if (stdout) log.info(label, `${label} stdout:\n${stdout}`);
  if (stderr) log.warn(label, `${label} stderr:\n${stderr}`);

  const output = stdout || stderr || "Done (no output)";
  const text = `
    \`${label}\`

    ${output.slice(-1500)}
  `;
  await msg.reply(text);
}

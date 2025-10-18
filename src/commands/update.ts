import { Message } from "../types/message"
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import redis from "../components/redis";

export const info = {
  command: "update",
  description: "Pull changes from the remote repository and show commit info.",
  usage: "update",
  example: "update",
  role: "admin",
  cooldown: 5000,
};

const execPromise = util.promisify(exec);

export default async function (msg: Message): Promise<void> {
  const { stdout, stderr } = await execPromise("git pull");
  if (stdout) log.info("Update", `git pull stdout:\n${stdout}`);
  if (stderr) log.warn("Update", `git pull stderr:\n${stderr}`);

  const { stdout: commitInfo } = await execPromise(
    'git log -1 --pretty=format:"%h - %s (%an, %ar)"',
  );

  const text = `
    \`Canis updated\`

    ${commitInfo}
    `;

  const response = stdout.includes("Already up to date")
    ? "Already up to date."
    : text;

  await msg.reply(response);
}

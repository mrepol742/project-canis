import { Message } from "../../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import redis from "../components/redis";

export const info = {
  command: "update",
  description: "Pull changes from the remote repository.",
  usage: "update",
  example: "update",
  role: "user",
  cooldown: 5000,
};

const execPromise = util.promisify(exec);

export default async function (msg: Message) {
  if (!/^update/i.test(msg.body)) return;
  const { stdout, stderr } = await execPromise("git pull");

  if (stdout) log.info("Update", `git pull stdout:\n${stdout}`);
  if (stderr) log.warn("Update", `git pull stderr:\n${stderr}`);

  await msg.reply(stdout || stderr);
}

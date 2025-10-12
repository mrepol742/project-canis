import { Message } from "../../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import redis from "../components/redis";

export const info = {
  command: "build",
  description: "Build the bot.",
  usage: "build",
  example: "build",
  role: "admin",
  cooldown: 5000,
};

const execPromise = util.promisify(exec);

export default async function (msg: Message) {
  if (!/^build$/.test(msg.body)) return;

  const { stdout, stderr } = await execPromise("npm run build");
  if (stdout) log.info("Build", `build stdout:\n${stdout}`);
  if (stderr) log.warn("Build", `build stderr:\n${stderr}`);

  await msg.reply(stdout || stderr);
}

import { Message } from "../../types/message";
import log from "../components/utils/log";
import { exec } from "child_process";
import util from "util";
import { prisma } from "../components/prisma";
import { getKey } from "../components/utils/rateLimiter";
import redis from "../components/redis";

export const info = {
  command: "update",
  description: "Pull changes from the remote repository.",
  usage: "update",
  example: "update",
  role: "admin",
  cooldown: 5000,
};

const execPromise = util.promisify(exec);

export default async function (msg: Message) {
  try {
    const { stdout, stderr } = await execPromise("git pull");

    if (stdout) log.info("Update", `git pull stdout:\n${stdout}`);
    if (stderr) log.warn("Update", `git pull stderr:\n${stderr}`);

    await msg.reply("Repository updated successfully!");
  } catch (error: any) {
    log.error("Update", `git pull failed: ${error.message}`);
    await msg.reply("Failed to update repository. Check logs.");
  }
}

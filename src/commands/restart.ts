import { Message } from "../../types/message";
import log from "../components/utils/log";
import logService from "../components/services/log";
import redis from "../components/redis";

export const info = {
  command: "restart",
  description: "Restart the bot.",
  usage: "restart",
  example: "restart",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^restart$/i.test(msg.body)) return;

  await Promise.all([
    redis.set(
      "restart",
      JSON.stringify({ id: msg.id.remote, date: Date.now() }),
    ),
    logService(msg, "restart", "Bot is restarting..."),
    msg.react("🔄"),
  ]);

  log.info("restart", "exiting...");
  process.exit(0);
}

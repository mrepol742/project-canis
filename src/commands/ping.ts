import { Message } from "../types/message"
import prisma from "../components/prisma";
import redis from "../components/redis";
import log from "../components/utils/log";
import speedtest from "../components/utils/speedtest";

export const info = {
  command: "ping",
  description: "Check if the bot is online.",
  usage: "ping",
  example: "ping",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const [networkLatency, redisLatency, prismaLatency] = await Promise.all([
    speedtest(),
    (async () => {
      const start = Date.now();
      await redis.ping();
      return Date.now() - start;
    })(),
    (async () => {
      const start = Date.now();
      try {
        await prisma.$queryRaw`SELECT 1`;
        return Date.now() - start;
      } catch (error) {
        log.error("Ping", "Database ping failed:", error);
      }
      return undefined;
    })(),
  ]);

  const nL = networkLatency?.ping.latency || 0;
  const rL = redisLatency || 0;
  const pL = prismaLatency || 0;
  const total = (nL + rL + pL) / 3;

  const text = `
    \`Pong ${total.toFixed(2)}ms\`

    Network: ${networkLatency?.ping.latency || "Unknown"}ms
    Redis: ${redisLatency || "Unknown"}ms
    Prisma: ${prismaLatency || "Unknown"}ms
  `;
  msg.reply(text);
}

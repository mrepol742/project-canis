import { createClient } from "redis";
import log from "./utils/log";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 30000, // 30 seconds
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

redis.on("error", (err) => log.error("Redis", err));

redis.connect();

export default redis;

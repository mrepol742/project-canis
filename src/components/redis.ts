import { createClient, type RedisClientType } from "redis";
import log from "./utils/log";
import { REDIS_URL } from "../config";

declare global {
  var _sharedRedis: RedisClientType;
}

if (!global._sharedRedis) {
  const client: RedisClientType = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 30000,
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  client.on("error", (err) => log.error("Redis", err));

  client.connect().catch((err) => log.error("Redis connection error", err));

  global._sharedRedis = client;
}

const redis = global._sharedRedis;
export default redis;

import type PQueue from "p-queue";

declare global {
  var _sharedPrisma: PrismaClient | undefined;
  var _sharedRedis: RedisClientType | undefined;
  var _sharedQueue: PQueue | undefined;
}

export {};

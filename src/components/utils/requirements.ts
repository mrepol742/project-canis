import { execSync } from "child_process";
import * as process from "process";
import semver from "semver";
import log from "./log";
import prisma from "../../components/prisma";
import redis from "../redis";

function checkNodeVersion() {
  const current = process.versions.node;
  const required = ">=24.0.0";
  if (!semver.satisfies(current, required)) {
    log.warn("Node", `Node.js ${required} required, found ${current}`);
  } else {
    log.info("Node", `Node.js ${current}`);
  }
}

async function checkDatabase() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root@127.0.0.1:3306";
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const end = Date.now() - start;
    log.info("Database", `Ping ${end}ms at ${dbUrl}`);
  } catch {
    log.error(
      "Database",
      "Database is required but not found (install mariadb or ensure server is running",
    );
    process.exit(1);
  }
}

async function checkRedis() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  try {
    const start = Date.now();
    await redis.ping();
    const end = Date.now() - start;
    log.info("Redis", `Ping ${end}ms at ${redisUrl}`);
  } catch {
    log.error(
      "Redis",
      "Redis is required but not found (install redis-cli or ensure server is running).",
    );
    process.exit(1);
  }
}

function checkChrome() {
  try {
    const version = execSync("google-chrome-stable --version")
      .toString()
      .trim();
    log.info("GoogleChrome", version);
  } catch {
    log.error(
      "GoogleChrome",
      "Google Chrome not found. Some features may not work.",
    );
  }
}

export function checkRequirements() {
  log.info("Requirements", "Checking bot requirements...");
  checkNodeVersion();
  checkDatabase();
  checkRedis();
  checkChrome();
  log.info("Requirements", "Bot requirements check complete.");
}

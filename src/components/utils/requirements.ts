import { execSync } from "child_process";
import * as process from "process";
import semver from "semver";
import log from "./log";
import prisma from "../../components/prisma";
import redis from "../redis";

function checkNodeVersion(): void {
  const current = process.versions.node;
  const required = ">=18.0.0";
  if (!semver.satisfies(current, required)) {
    log.warn("Node", `Node.js ${required} required, found ${current}`);
  } else {
    log.info("Node", `Node.js ${current}`);
  }
}

async function checkDatabase(): Promise<void> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const end = Date.now() - start;
    log.info("Database", `${end}ms Ping`);
  } catch (err) {
    log.error(
      "Failed to connect to Database make sure your database is running",
      err,
    );
    process.exit(1);
  }
}

async function checkRedis(): Promise<void> {
  try {
    const start = Date.now();
    await redis.ping();
    const end = Date.now() - start;
    log.info("Redis", `${end}ms Ping`);
  } catch (err) {
    log.error(
      "Failed to connect to Redis make sure redis-server is running",
      err,
    );
    process.exit(1);
  }
}

function checkChrome(): void {
  try {
    const version = execSync("google-chrome-stable --version")
      .toString()
      .trim();
    log.info("GoogleChrome", version);
  } catch (err) {
    log.error("Failed to find Google Chrome executable", err);
  }
}

function checkFFMPEG(): void {
  try {
    const version = execSync("ffmpeg -version")
      .toString()
      .split("\n")[0]
      .trim();
    log.info("FFMPEG", version);
  } catch (err) {
    log.warn("Failed to find FFMPEG, some commands might fail to work", err);
  }
}

export async function checkRequirements() {
  log.info("Requirements", "Checking bot requirements...");
  checkNodeVersion();
  checkChrome();
  checkFFMPEG();
  await Promise.all([checkDatabase(), checkRedis()]);
  log.info("Requirements", "Bot requirements check complete.");
}

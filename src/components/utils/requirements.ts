import { execSync } from "child_process";
import * as process from "process";
import semver from "semver";
import log from "./log";
import url from "url";

function checkNodeVersion() {
  const current = process.versions.node;
  const required = ">=24.0.0";
  if (!semver.satisfies(current, required)) {
    log.warn("Node", `Node.js ${required} required, found ${current}`);
  } else {
    log.info("Node", `Node.js ${current}`);
  }
}

function checkMySQL() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root@127.0.0.1:3306";
  try {
    const version = execSync("mariadb --version").toString().trim();
    log.info("MySQL", version);
  } catch {
    log.error(
      "MySQL",
      "MySQL is required but not found (install mysql-client or ensure server is accessible).",
    );
    process.exit(1);
  }
}

function checkRedis() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  try {
    const version = execSync("redis-cli --version").toString().trim();
    log.info("Redis", version);
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

function checkFFMPEG() {
  try {
    const version = execSync("ffmpeg -version")
      .toString()
      .split("\n")[0]
      .trim();
    log.info("FFMPEG", version);
  } catch {
    log.warn("FFMPEG", "FFmpeg not found. Some features may not work.");
  }
}

export function checkRequirements() {
  log.info("Requirements", "Checking bot requirements...");
  checkNodeVersion();
  checkMySQL();
  checkRedis();
  checkChrome();
  checkFFMPEG();
  log.info("Requirements", "Bot requirements check complete.");
}

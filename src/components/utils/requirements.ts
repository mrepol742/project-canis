import { execSync } from "child_process";
import * as process from "process";
import semver from "semver";
import log from "./log";
import url from "url";

function checkNodeVersion() {
  const current = process.versions.node;
  const required = ">=24.0.0";
  if (!semver.satisfies(current, required)) {
    log.warn("Requirements", `Node.js ${required} required, found ${current}`);
  } else {
    log.info("Requirements", `Node.js version OK: ${current}`);
  }
}

function safePrintDBUrl(dbUrl: string, fallback: string) {
  try {
    const parsed = new url.URL(dbUrl);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || ""}`;
  } catch {
    return fallback;
  }
}

function checkMySQL() {
  const dbUrl = process.env.DATABASE_URL || "mysql://root@127.0.0.1:3306";
  try {
    const version = execSync("mysql --version").toString().trim();
    log.info(
      "Requirements",
      `MySQL available at ${safePrintDBUrl(dbUrl, "mysql://127.0.0.1:3306")} | ${version}`,
    );
  } catch {
    log.error("Requirements", "MySQL is required but not found (install mysql-client or ensure server is accessible).");
    process.exit(1);
  }
}

function checkRedis() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  try {
    const version = execSync("redis-cli --version").toString().trim();
    log.info(
      "Requirements",
      `Redis available at ${safePrintDBUrl(redisUrl, "redis://localhost:6379")} | ${version}`,
    );
  } catch {
    log.error("Requirements", "Redis is required but not found (install redis-cli or ensure server is running).");
    process.exit(1);
  }
}

function checkChrome() {
  try {
    const version = execSync("google-chrome-stable --version").toString().trim();
    log.info("Requirements", `Google Chrome installed | ${version}`);
  } catch {
    try {
      const version = execSync("chromium --version").toString().trim();
      log.info("Requirements", `Chromium installed | ${version}`);
    } catch {
      log.error("Requirements", "Google Chrome/Chromium is required but not found.");
      process.exit(1);
    }
  }
}

function checkFFMPEG() {
  try {
    const version = execSync("ffmpeg -version").toString().split("\n")[0].trim();
    log.info("Requirements", `FFmpeg installed | ${version}`);
  } catch {
    log.warn("Requirements", "FFmpeg not found. Some features may not work.");
  }
}

export function checkRequirements() {
  log.info("Requirements", "Checking system requirements...");
  checkNodeVersion();
  checkMySQL();
  checkRedis();
  checkChrome();
  checkFFMPEG();
  log.info("Requirements", "System check complete.");
}

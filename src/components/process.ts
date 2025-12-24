import * as Sentry from "@sentry/node";
import log from "./utils/log";
import { client } from "./client";
import redis from "./redis";
import downloadQueue from "./queue/download";
import reactQueue from "./queue/react";
import prisma from "./prisma";
import { COMMAND_PREFIX, PROJECT_CANIS_ALIAS } from "../config";

async function gracefulShutdown(signal: string): Promise<void> {
  log.info("Process", `Received ${signal}, shutting down...`);

  try {
    const popupBrowser = (await client()).pupBrowser;
    if (popupBrowser) {
      await popupBrowser.close();
      log.info("Browser", "Puppeteer browser closed successfully.");
    }
    // all work must be empty, before it send a SAVE Command to redis
    // avoiding conflicts when exiting the redis and db
    await Promise.allSettled([downloadQueue.onIdle(), reactQueue.onIdle()]);
    redis.sendCommand(["SAVE"]);
    await Promise.allSettled([redis.quit(), prisma.$disconnect()]);
  } catch (err) {
    Sentry.captureException(err);
    log.error("Browser", `Error closing browser: ${(err as Error).message}`);
  } finally {
    process.exit(0);
  }
}

["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, async () => await gracefulShutdown(signal));
});

process.on("uncaughtException", (err, origin) => {
  Sentry.captureException(err);
  log.error(
    "UncaughtException",
    `Exception: ${err.message}\nOrigin: ${origin}`,
  );
});

process.on("unhandledRejection", (reason, promise) => {
  log.error("UnhandledRejection", `Reason: ${reason}\nPromise: ${promise}`);
});

log.info("Bot", `Initiating ${PROJECT_CANIS_ALIAS}...`);
log.info("Bot", `prefix: ${COMMAND_PREFIX}`);
log.info("Process", "Event listeners for process signals have been set up.");

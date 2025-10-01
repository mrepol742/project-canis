import * as Sentry from "@sentry/node";
import log from "./utils/log";
import { client } from "./client";

async function gracefulShutdown(signal: string) {
  log.info("Process", `Received ${signal}, shutting down...`);

  try {
    const popupBrowser = (await client()).pupBrowser;
    if (popupBrowser) {
      await popupBrowser.close();
      log.info("Browser", "Puppeteer browser closed successfully.");
    }
  } catch (err) {
    log.error("Browser", `Error closing browser: ${(err as Error).message}`);
  }

  process.exit(0);
}

["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
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

log.info("Bot", `Initiating ${process.env.PROJECT_CANIS_ALIAS || "Canis"}...`);
log.info("Bot", `prefix: ${process.env.COMMAND_PREFIX || "!"}`);
log.info("Process", "Event listeners for process signals have been set up.");

import { watch } from "fs/promises";
import loader from "./loader";
import log from "../log";
import * as Sentry from "@sentry/node";
import { commandDirs } from "./loader";

export default async function (): Promise<void> {
  try {
    for (const dir of commandDirs) {
      const watcher = watch(dir, { recursive: false });

      for await (const event of watcher) {
        const { eventType, filename } = event;
        if (filename && /\.(js|ts)$/.test(filename)) {
          try {
            await loader(filename, dir);
            log.info("Loader", `Reloaded command: ${filename}`);
          } catch (err) {
            log.error("Loader", `Failed to reload command: ${filename}`, err);
          }
        }
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    log.error("Loader", "Error on command watcher:", err);
  }
}

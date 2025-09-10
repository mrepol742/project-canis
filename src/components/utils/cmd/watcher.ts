import { watch } from "fs/promises";
import loader from "./loader";
import log from "../log";

export default async function (commandsPath: string) {
  const watcher = watch(commandsPath, { recursive: false });

  for await (const event of watcher) {
    const { eventType, filename } = event;
    if (filename && /\.(js|ts)$/.test(filename)) {
      try {
        await loader(filename);
        log.info("Loader", `Reloaded command: ${filename}`);
      } catch (err) {
        log.error("Loader", `Failed to reload command: ${filename}`, err);
      }
    }
  }
}

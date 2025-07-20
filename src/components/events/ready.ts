import log from "../utils/log";
import fs from "fs";
import path from "path";
import { client } from "../client";
import sleep from "../utils/sleep";

export default async function ready() {
  log.info("Client", "WhatsApp client is ready!");

  await sleep(5000); // Give some time for the client to stabilize

  const hotReloadPath = path.resolve(__dirname, "../../../.temp/restart");
  if (fs.existsSync(hotReloadPath)) {
    try {
      const tempData = JSON.parse(fs.readFileSync(hotReloadPath, "utf-8"));

      await client.sendMessage(tempData.id.remote, "Done");
    } catch (err) {
      log.error("restart", err);
    } finally {
      fs.unlink(hotReloadPath, (err) => {
        if (err) {
          log.error("restart", "Failed to delete restart file:", err);
        } else {
          log.info("restart", "Restart file deleted successfully.");
        }
      });
    }
  }
}

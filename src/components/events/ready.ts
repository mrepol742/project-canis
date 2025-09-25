import log from "../utils/log";
import fs from "fs";
import path from "path";
import { client } from "../client";
import sleep from "../utils/sleep";

export default async function () {
  log.info("Client", "WhatsApp client is ready!");

  await sleep(5000); // Give some time for the client to stabilize

  const hotReloadPath = path.resolve(__dirname, "../../../.temp/restart");
  if (fs.existsSync(hotReloadPath)) {
    try {
      const tempData = JSON.parse(fs.readFileSync(hotReloadPath, "utf-8"));

      await client.sendMessage(tempData.id.remote, "Restart Finished.");
    } catch (err) {
      log.error("Restart", err);
    } finally {
      fs.unlink(hotReloadPath, (err) => {
        if (err) {
          log.error("Restart", "Failed to delete restart file:", err);
        } else {
          log.info("Restart", "Restart file deleted successfully.");
        }
      });
    }
  }
}

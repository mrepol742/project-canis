import log from "../utils/log";
import fs from "fs";
import path from "path";
import { client } from "../client";
import sleep from "../utils/sleep";

export default async function ready() {
  log.info("Client", "WhatsApp client is ready!");

  await sleep(5000); // Give some time for the client to stabilize

  const hotReloadPath = path.resolve(__dirname, "../../../.temp/hotreload");
  if (fs.existsSync(hotReloadPath)) {
    try {
      const tempData = JSON.parse(fs.readFileSync(hotReloadPath, "utf-8"));

      let chatId = null;
      if (typeof tempData.id === "string") {
        chatId = tempData.id;
      } else if (tempData.id?._serialized) {
        chatId = tempData.id._serialized;
      } else if (tempData.id?.id) {
        chatId = tempData.id.id + "@c.us";
      }

      if (chatId) {
        await client.sendMessage(chatId, "Hot reload done.");
        return;
      }
      log.error("Hot Reload", "Could not resolve chat ID for message.");
    } catch (err) {
      log.error("Hot Reload", err);
    } finally {
      fs.unlink(hotReloadPath, (err) => {
        if (err) {
          log.error("Hot Reload", "Failed to delete hot reload file:", err);
        } else {
          log.info("Hot Reload", "Hot reload file deleted successfully.");
        }
      });
    }
  }
};
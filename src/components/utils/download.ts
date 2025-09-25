import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { MessageMedia } from "whatsapp-web.js";
import axios from "../axios";
import log from "./log";

export async function download(
  url: string,
  format: string,
): Promise<MessageMedia> {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const tempDir = path.resolve(".temp");
  await fs.mkdir(tempDir, { recursive: true });

  const filename = `${crypto.randomUUID()}${format}`;
  const tempPath = path.join(tempDir, filename);

  try {
    await fs.writeFile(tempPath, response.data, "base64");

    // Schedule deletion after 1 minute
    setTimeout(async () => {
      try {
        await fs.unlink(tempPath);
        log.info("Download", `Temporary file deleted: ${tempPath}`);
      } catch (err) {
        log.error(
          "Download",
          `Failed to delete temp file: ${(err as Error).message}`,
        );
      }
    }, 60 * 1000);

    return MessageMedia.fromFilePath(tempPath);
  } catch (err) {
    throw new Error(
      `Failed to create MessageMedia (format: ${format}): ${(err as Error).message}`,
    );
  }
}

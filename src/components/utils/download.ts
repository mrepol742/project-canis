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
  const tempDir = path.resolve(".temp");
  await fs.mkdir(tempDir, { recursive: true });

  const hash = crypto.createHash("md5").update(url).digest("hex");
  const filename = `${hash}${format.startsWith(".") ? format : `.${format}`}`;
  const tempPath = path.join(tempDir, filename);

  try {
    try {
      await fs.access(tempPath);
      log.info("Download", `Cache hit: ${filename}`);
      return MessageMedia.fromFilePath(tempPath);
    } catch {
      log.info("Download", `Cache miss: downloading ${url}`);
    }

    const response = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(tempPath, response.data);

    return MessageMedia.fromFilePath(tempPath);
  } catch (err) {
    throw new Error(
      `Failed to create MessageMedia (format: ${format}): ${(err as Error).message}`,
    );
  }
}

import { Message } from "whatsapp-web.js";
import fs from "fs/promises";
import log from "../components/utils/log";

export const command = "restart";
export const role = "admin";

export default async function (msg: Message) {
  await msg.react("🔄");

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const tempPath = `${tempDir}/restart`;
  await fs.writeFile(tempPath, JSON.stringify(msg));

  log.info("restart", "exiting...");
  process.exit(0);
}

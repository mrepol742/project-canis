import { prisma } from "../prisma";
import log from "../utils/log";
import { Message } from "whatsapp-web.js";

export default async function (
  msg: Message,
  command: string,
  output?: string
): Promise<void> {
  try {
    const lid = msg.id.remote.split("@")[0];
    await prisma.log.create({
      data: {
        lid,
        command,
        output: output,
      },
    });
  } catch (error) {
    log.error("Database", "Failed to log command.", error);
  }
}

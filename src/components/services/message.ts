import { prisma } from "../prisma";
import log from "../../components/utils/log";
import { Message } from "whatsapp-web.js";

export async function addMessage(
  msg: Message,
  body: string,
  type: string
): Promise<void> {
  try {

    const lid = msg.id.remote.split("@")[0];
    await prisma.message.create({
      data: {
        lid,
        content: body,
        type: type,
      },
    });
  } catch (error) {
    log.error("Database", "Failed to add message.", error);
  }
}

import { prisma } from "../prisma";
import log from "../../components/utils/log";
import { Message } from "whatsapp-web.js";

const MAX_LENGTH = 191;

function filterContent(body: string): string {
  if (body.length <= MAX_LENGTH) return body;

  const cutoff = MAX_LENGTH - " [REDACTED]".length;
  return body.slice(0, cutoff) + " [REDACTED]";
}

export async function addMessage(
  msg: Message,
  body: string,
  type: string,
): Promise<void> {
  if (!body) return;

  try {
    const lid = msg.id.remote.split("@")[0];
    await prisma.message.create({
      data: {
        lid,
        content: filterContent(body),
        type: type,
      },
    });
  } catch (error) {
    log.error("Database", "Failed to add message.", error);
  }
}

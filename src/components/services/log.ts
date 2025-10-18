import prisma from "../prisma";
import log from "../utils/log";
import { Message } from "whatsapp-web.js";
import * as Sentry from "@sentry/node";

const MAX_LENGTH = 191;

function filterContent(body: string): string {
  if (body.length <= MAX_LENGTH) return body;

  const cutoff = MAX_LENGTH - " [REDACTED]".length;
  return body.slice(0, cutoff) + " [REDACTED]";
}

export default async function (
  msg: Message,
  command: string,
  output?: string,
): Promise<void> {
  try {
    const lid = (msg.author ?? msg.from).split("@")[0];

    await prisma.log.create({
      data: {
        lid,
        command: filterContent(command),
        output: output ? filterContent(output) : "",
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", "Failed to log command.", error);
  }
}

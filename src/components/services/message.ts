import prisma from "../prisma";
import log from "../../components/utils/log";
import * as Sentry from "@sentry/node";

const MAX_LENGTH = 191;

function filterContent(body: string): string {
  if (body.length <= MAX_LENGTH) return body;

  const cutoff = MAX_LENGTH - " [REDACTED]".length;
  return body.slice(0, cutoff) + " [REDACTED]";
}

export async function addMessage(
  lid: string,
  body: string,
  type: string,
): Promise<void> {
  if (!body) return;

  try {
    await prisma.message.create({
      data: {
        lid,
        content: filterContent(body),
        type: type,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", "Failed to add message.", error);
  }
}

export async function getMessage(lid: string) {
  try {
    const message = await prisma.message.findFirst({
      where: {
        lid,
      },
    });

    return message;
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", "Failed to get message.", error);
  }
  return null;
}

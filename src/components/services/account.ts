import prisma from "../prisma";
import log from "../../components/utils/log";
import * as Sentry from "@sentry/node";
import crypto from "crypto";

export async function getRootAccount(): Promise<string> {
  try {
    const user = await prisma.account.findFirst({
      where: {
        isRoot: true,
      },
    });
    return user ? user.clientId : crypto.randomBytes(16).toString("hex");
  } catch (error) {
    Sentry.captureException(error);
    log.error("Database", `Failed to find root account.`, error);
  }
  return crypto.randomBytes(16).toString("hex");
}

export async function createAccount(
  clientId: string,
  isRoot = false,
): Promise<void> {
  try {
    const existing = await prisma.account.findUnique({
      where: { clientId },
    });

    if (existing) {
      log.info("Database", `Account for clientId ${clientId} already exists.`);
      return;
    }

    await prisma.account.create({
      data: { clientId, isRoot },
    });

    log.info("Database", `Account created for clientId ${clientId}`);
  } catch (error) {
    Sentry.captureException(error);
    log.error(
      "Database",
      `Failed to create account for clientId: ${clientId}`,
      error,
    );
  }
}

export async function deleteAccount(clientId: string): Promise<void> {
  try {
    await prisma.account.delete({
      where: {
        clientId,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    log.error(
      "Database",
      `Failed to delete account for clientId: ${clientId}`,
      error,
    );
  }
}

export async function getAccountCount(): Promise<number> {
  try {
    const count = await prisma.account.count();
    return count;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to get account count:", error);
    return 0;
  }
}

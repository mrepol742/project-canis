import { PrismaClient } from "@prisma/client";

const nodeEnv = process.env.NODE_ENV || "development";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
  });

if (nodeEnv !== "production") globalForPrisma.prisma = prisma;

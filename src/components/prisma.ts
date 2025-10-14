import { PrismaClient } from "@prisma/client";

const nodeEnv = process.env.NODE_ENV || "development";

if (!global._sharedPrisma) {
  global._sharedPrisma = new PrismaClient({
    log: ["warn", "error"],
  });
}

const prisma = global._sharedPrisma;

export default prisma;

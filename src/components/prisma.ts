import { PrismaClient } from "@prisma/client";

declare global {
  var _sharedPrisma: PrismaClient;
}

if (!global._sharedPrisma) {
  global._sharedPrisma = new PrismaClient({
    log: ["warn", "error"],
  });
}

const prisma = global._sharedPrisma;

export default prisma;

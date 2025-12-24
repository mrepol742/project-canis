import {
  NODE_ENV,
  PRISMA_MARIA_DB_DATABASE,
  PRISMA_MARIA_DB_HOST,
  PRISMA_MARIA_DB_PASSWORD,
  PRISMA_MARIA_DB_USER,
} from "../config";
import { PrismaClient } from "../generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaMariaDb({
  host: PRISMA_MARIA_DB_HOST,
  user: PRISMA_MARIA_DB_USER,
  password: PRISMA_MARIA_DB_PASSWORD,
  database: PRISMA_MARIA_DB_DATABASE,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

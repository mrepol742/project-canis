import { PrismaClient } from "../generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaMariaDb({
  host: process.env.PRISMA_MARIA_DB_HOST ?? "127.0.0.1",
  user: process.env.PRISMA_MARIA_DB_USER ?? "root",
  password: process.env.PRISMA_MARIA_DB_PASSWORD ?? "",
  database: process.env.PRISMA_MARIA_DB_DATABASE ?? "project_canis",
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

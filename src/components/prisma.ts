import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function getPrismaClient() {
  return prisma;
}
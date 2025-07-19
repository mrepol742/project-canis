"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const nodeEnv = process.env.NODE_ENV || "development";
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ||
    new prisma_1.PrismaClient({
        log: ["warn", "error"],
    });
if (nodeEnv !== "production")
    globalForPrisma.prisma = exports.prisma;

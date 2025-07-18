"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPrismaClient;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getPrismaClient() {
    return prisma;
}

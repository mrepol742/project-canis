"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateUser = findOrCreateUser;
exports.isBlocked = isBlocked;
exports.getUserCount = getUserCount;
exports.getBlockUserCount = getBlockUserCount;
const prisma_1 = require("../prisma");
const log_1 = __importDefault(require("../../components/utils/log"));
async function findOrCreateUser(msg) {
    try {
        const jid = msg.author || msg.from;
        const lid = jid.split("@")[0];
        let user = await prisma_1.prisma.user.findUnique({
            where: { lid },
        });
        if (user) {
            await prisma_1.prisma.user.update({
                where: { lid },
                data: {
                    commandCount: {
                        increment: 1,
                    },
                },
            });
            return false;
        }
        const contact = await msg.getContact();
        const countryCode = await contact.getCountryCode();
        const about = await contact.getAbout();
        const name = contact.pushname || contact.name || "Unknown";
        user = await prisma_1.prisma.user.create({
            data: {
                lid,
                name,
                number: contact.number,
                countryCode,
                type: contact.isBusiness ? "business" : "private",
                mode: msg.author ? "group" : "private",
                about: about,
                commandCount: 1
            },
        });
    }
    catch (error) {
        log_1.default.error("Database", `Failed to find or create user.`, error);
    }
    return true;
}
async function isBlocked(lid) {
    try {
        const block = await prisma_1.prisma.block.findUnique({
            where: {
                lid,
            },
        });
        log_1.default.info("block", block);
        return block !== null;
    }
    catch (error) {
        log_1.default.error("Database", `Failed to check if user is blocked.`, error);
    }
    return false;
}
async function getUserCount() {
    try {
        const count = await prisma_1.prisma.user.count();
        return count;
    }
    catch (error) {
        console.error("Failed to get user count:", error);
        return 0;
    }
}
async function getBlockUserCount() {
    try {
        const count = await prisma_1.prisma.block.count();
        return count;
    }
    catch (error) {
        console.error("Failed to get block user count:", error);
        return 0;
    }
}

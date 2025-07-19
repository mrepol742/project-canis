"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = block;
const prisma_1 = require("../components/prisma");
exports.command = "block";
exports.role = "admin";
async function block(msg) {
    if (msg.mentionedIds.length === 0) {
        await msg.reply("Please mention a user to block.");
        return;
    }
    for (const userId of msg.mentionedIds) {
        const lid = userId.split("@")[0];
        await prisma_1.prisma.block.upsert({
            where: { lid },
            update: {},
            create: { lid, mode: msg.author ? "group" : "private" },
        });
    }
    await msg.react("✅");
}

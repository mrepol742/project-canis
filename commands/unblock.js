"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = unblock;
const prisma_1 = require("../components/prisma");
exports.command = "unblock";
exports.role = "admin";
async function unblock(msg) {
    if (msg.mentionedIds.length === 0) {
        await msg.reply("Please mention a user to ublock.");
        return;
    }
    for (const userId of msg.mentionedIds) {
        const lid = userId.split("@")[0];
        await prisma_1.prisma.block.delete({
            where: { lid },
        });
    }
    await msg.react("✅");
}

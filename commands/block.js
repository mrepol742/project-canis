"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const prisma_1 = require("../components/prisma");
exports.info = {
    command: "block",
    description: "Block users from the bot.",
    usage: "block <@user>",
    example: "block @user123",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    if (msg.mentionedIds.length === 0) {
        await msg.reply("Please mention a user to block.");
        return;
    }
    await msg.react("🔄");
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

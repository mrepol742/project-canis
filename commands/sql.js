"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const prisma_1 = require("../components/prisma");
exports.info = {
    command: "sql",
    description: "Execute a SQL query and return the result.",
    usage: "sql <query>",
    example: "sql SELECT * FROM users WHERE active = true;",
    role: "admin",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^sql\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a sql.");
        return;
    }
    const result = await prisma_1.prisma.$queryRawUnsafe(query);
    await msg.reply(JSON.stringify(result, null, 2));
}

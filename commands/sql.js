"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const log_1 = __importDefault(require("../components/utils/log"));
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
    try {
        const result = await prisma_1.prisma.$queryRawUnsafe(query);
        await msg.reply(JSON.stringify(result, null, 2));
    }
    catch (error) {
        log_1.default.error("sql", `Error querying data: ${error.message}`);
        await msg.reply(`Error querying data for "${query}". Please try again later.`);
    }
}

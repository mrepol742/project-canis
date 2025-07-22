"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const prisma_1 = require("../prisma");
const log_1 = __importDefault(require("../utils/log"));
async function default_1(msg, command, output) {
    try {
        const lid = msg.id.remote.split("@")[0];
        await prisma_1.prisma.log.create({
            data: {
                lid,
                command,
                output: output,
            },
        });
    }
    catch (error) {
        log_1.default.error("Database", "Failed to log command.", error);
    }
}

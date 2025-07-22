"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMessage = addMessage;
const prisma_1 = require("../prisma");
const log_1 = __importDefault(require("../../components/utils/log"));
async function addMessage(msg, body, type) {
    try {
        const lid = msg.id.remote.split("@")[0];
        await prisma_1.prisma.message.create({
            data: {
                lid,
                content: body,
                type: type,
            },
        });
    }
    catch (error) {
        log_1.default.error("Database", "Failed to add message.", error);
    }
}

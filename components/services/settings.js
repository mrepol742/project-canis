"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSetting = saveSetting;
exports.getSetting = getSetting;
exports.getAllSettings = getAllSettings;
const prisma_1 = require("../prisma");
const log_1 = __importDefault(require("../../components/utils/log"));
async function saveSetting(name, value) {
    try {
        await prisma_1.prisma.settings.upsert({
            where: { name },
            update: {
                value,
            },
            create: {
                name,
                value,
            },
        });
    }
    catch (error) {
        log_1.default.error("Database", "Failed to add message.", error);
    }
}
async function getSetting(name) {
    try {
        const setting = await prisma_1.prisma.settings.findUnique({
            where: { name },
        });
        return setting ? setting.value : null;
    }
    catch (error) {
        log_1.default.error("Database", `Failed to get setting: ${name}`, error);
        return null;
    }
}
async function getAllSettings() {
    try {
        const settings = await prisma_1.prisma.settings.findMany();
        return settings.reduce((acc, setting) => {
            acc[setting.name] = setting.value;
            return acc;
        }, {});
    }
    catch (error) {
        log_1.default.error("Database", "Failed to get all settings.", error);
        return {};
    }
}

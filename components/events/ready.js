"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ready;
const log_1 = __importDefault(require("../utils/log"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("../client");
const sleep_1 = __importDefault(require("../utils/sleep"));
async function ready() {
    log_1.default.info("Client", "WhatsApp client is ready!");
    await (0, sleep_1.default)(5000);
    const hotReloadPath = path_1.default.resolve(__dirname, "../../../.temp/hotreload");
    if (fs_1.default.existsSync(hotReloadPath)) {
        try {
            const tempData = JSON.parse(fs_1.default.readFileSync(hotReloadPath, "utf-8"));
            let chatId = null;
            if (typeof tempData.id === "string") {
                chatId = tempData.id;
            }
            else if (tempData.id?._serialized) {
                chatId = tempData.id._serialized;
            }
            else if (tempData.id?.id) {
                chatId = tempData.id.id + "@c.us";
            }
            if (chatId) {
                await client_1.client.sendMessage(chatId, "Hot reload done.");
                return;
            }
            log_1.default.error("Hot Reload", "Could not resolve chat ID for message.");
        }
        catch (err) {
            log_1.default.error("Hot Reload", err);
        }
        finally {
            fs_1.default.unlink(hotReloadPath, (err) => {
                if (err) {
                    log_1.default.error("Hot Reload", "Failed to delete hot reload file:", err);
                }
                else {
                    log_1.default.info("Hot Reload", "Hot reload file deleted successfully.");
                }
            });
        }
    }
}
;

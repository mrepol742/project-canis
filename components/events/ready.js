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
    const hotReloadPath = path_1.default.resolve(__dirname, "../../../.temp/restart");
    if (fs_1.default.existsSync(hotReloadPath)) {
        try {
            const tempData = JSON.parse(fs_1.default.readFileSync(hotReloadPath, "utf-8"));
            await client_1.client.sendMessage(tempData.id.remote, "Done");
        }
        catch (err) {
            log_1.default.error("restart", err);
        }
        finally {
            fs_1.default.unlink(hotReloadPath, (err) => {
                if (err) {
                    log_1.default.error("restart", "Failed to delete restart file:", err);
                }
                else {
                    log_1.default.info("restart", "Restart file deleted successfully.");
                }
            });
        }
    }
}

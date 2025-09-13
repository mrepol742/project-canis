"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const log_1 = __importDefault(require("./utils/log"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const message_1 = __importDefault(require("./events/message"));
const edit_1 = __importDefault(require("./events/edit"));
const leave_1 = __importDefault(require("./events/groups/leave"));
const join_1 = __importDefault(require("./events/groups/join"));
const reaction_1 = __importDefault(require("./events/reaction"));
const ready_1 = __importDefault(require("./events/ready"));
const revoke_1 = __importDefault(require("./events/revoke"));
const loadingBar = new cli_progress_1.default.SingleBar({
    format: "Loading | {bar} | {value}%",
    barCompleteChar: "█",
    barIncompleteChar: "-",
    hideCursor: true,
}, cli_progress_1.default.Presets.shades_classic);
const client = new whatsapp_web_js_1.Client({
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXEC_PATH || "/opt/google/chrome/google-chrome",
    },
    authStrategy: new whatsapp_web_js_1.LocalAuth(),
});
exports.client = client;
let isLoadingBarStarted = false;
client.on("loading_screen", (percent, message) => {
    if (!isLoadingBarStarted) {
        loadingBar.start(100, 0, { message });
        isLoadingBarStarted = true;
    }
    loadingBar.update(percent, { message });
});
client.on("authenticated", () => log_1.default.info("Auth", "Client authenticated successfully."));
client.on("qr", (qr) => {
    log_1.default.info("QR", "Scan this QR code with your WhatsApp app:");
    qrcode_terminal_1.default.generate(qr, { small: true });
});
client.on("ready", async () => {
    loadingBar.stop();
    (0, ready_1.default)();
});
client.on("message_reaction", async (react) => (0, reaction_1.default)(client, react));
client.on("message_create", async (msg) => (0, message_1.default)(msg));
client.on("message_edit", async (msg, newBody, prevBody) => (0, edit_1.default)(msg, newBody, prevBody));
client.on("message_revoke_everyone", async (msg, revoked_msg) => (0, revoke_1.default)(msg, revoked_msg));
client.on("group_join", async (notif) => (0, join_1.default)(notif));
client.on("group_leave", async (notif) => (0, leave_1.default)(notif));
client.on("auth_failure", (msg) => log_1.default.error("Auth", "Authentication failed. Please try again."));
client.initialize();

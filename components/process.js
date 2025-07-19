"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_1 = __importDefault(require("./utils/log"));
process.on("SIGHUP", function () {
    process.exit(0);
});
process.on("SIGTERM", function () {
    process.exit(0);
});
process.on("SIGINT", function () {
    process.kill(process.pid);
    process.exit(0);
});
process.on("uncaughtException", (err, origin) => {
    log_1.default.error("Uncaught Exception", `Exception: ${err.message}\nOrigin: ${origin}`);
});
process.on("unhandledRejection", (reason, promise) => {
    log_1.default.error("Unhandled Rejection", `Reason: ${reason}\nPromise: ${promise}`);
});
process.on("beforeExit", (code) => {
    log_1.default.info("Before Exit", `Process is about to exit with code: ${code}`);
});
process.on("exit", (code) => {
    console.log("");
});
log_1.default.info("Process", "Event listeners for process signals have been set up.");

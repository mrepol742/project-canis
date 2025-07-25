"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const log_1 = __importDefault(require("./utils/log"));
const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const MAX_PORT_TRIES = 10;
function startServer(port, tries = 0) {
    const server = http_1.default.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Bot is running\n");
    });
    server.listen(port, () => {
        log_1.default.info("Server", `HTTP server started on port ${port}`);
    });
    server.on("error", (err) => {
        if (err.code === "EADDRINUSE" && tries < MAX_PORT_TRIES) {
            log_1.default.warn("Server", `Port ${port} in use, trying port ${port + 1}`);
            startServer(port + 1, tries + 1);
        }
        else {
            log_1.default.error("Server", `Failed to start server: ${err.message}`);
            process.exit(1);
        }
    });
    return server;
}
const port = Number(process.env.PORT) || DEFAULT_PORT;
const server = startServer(port);
exports.default = server;

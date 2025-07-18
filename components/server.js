"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const log_1 = __importDefault(require("../components/log"));
const port = process.env.PORT || 3000;
http_1.default
    .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running\n");
})
    .listen(port, () => {
    log_1.default.info("Server", `HTTP server started on port ${port}`);
});

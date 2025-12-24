import http from "http";
import log from "./utils/log";
import * as Sentry from "@sentry/node";
import { PORT } from "../config";

const MAX_PORT_TRIES = 10;

function startServer(port: number, tries = 0) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running\n");
  });

  server.listen(port, () => {
    log.info("Server", `HTTP server started on port ${port}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE" && tries < MAX_PORT_TRIES) {
      log.warn("Server", `Port ${port} in use, trying port ${port + 1}`);
      startServer(port + 1, tries + 1);
    } else {
      log.error("Server", `Failed to start server: ${err.message}`);
      process.exit(1);
    }
    Sentry.captureException(err);
  });

  return server;
}

const server = startServer(PORT);

export default server;

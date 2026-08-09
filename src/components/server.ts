import http from "http";
import log from "./utils/log";
import * as Sentry from "@sentry/node";
import { PORT } from "../config";
import { handleRoute } from "../route";

const MAX_PORT_TRIES = 10;

function startServer(port: number, tries = 0) {
  const server = http.createServer((req, res) => {
    void handleRoute(req, res).catch((err: Error) => {
      log.error("Server", `Request handling failed: ${err.message}`);
      Sentry.captureException(err);

      if (!res.headersSent) {
        res.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
        });
      }

      res.end(
        JSON.stringify({
          ok: false,
          error: "Internal Server Error",
        }),
      );
    });
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

import http from "http";
import log from "./utils/log";

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
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
  });

  return server;
}

const port = Number(process.env.PORT) || DEFAULT_PORT;
const server = startServer(port);

export default server;

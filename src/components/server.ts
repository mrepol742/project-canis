import http from "http";
import log from "./utils/log";

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running\n");
});

server.listen(port, () => {
  log.info("Server", `HTTP server started on port ${port}`);
});

export default server;

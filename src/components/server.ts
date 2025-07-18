import http from "http";
import log from "../components/log";

const port = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running\n");
  })
  .listen(port, () => {
    log.info("Server", `HTTP server started on port ${port}`);
  });

import log from "./utils/log";

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
  log.error(
    "UncaughtException",
    `Exception: ${err.message}\nOrigin: ${origin}`
  );
});

process.on("unhandledRejection", (reason, promise) => {
  log.error("UnhandledRejection", `Reason: ${reason}\nPromise: ${promise}`);
});

process.on("beforeExit", (code) => {
  log.info("BeforeExit", `Process is about to exit with code: ${code}`);
});

process.on("exit", (code) => {
  console.log("");
});

log.info("Process", "Event listeners for process signals have been set up.");

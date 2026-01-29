import dotenv from "dotenv";
dotenv.config({ quiet: true, debug: process.env.NODE_ENV === "production" });

import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import log from "./components/utils/log";
import { checkRequirements } from "./components/utils/requirements";

const [, , scriptArg, ...scriptArgs] = process.argv;

if (!scriptArg) {
  log.error("Runner", "No script provided");
  process.exit(1);
}

const SCRIPT_TO_RUN = path.resolve(scriptArg);
const EXT = path.extname(SCRIPT_TO_RUN);

let RUNTIME: "node" | "ts-node";

switch (EXT) {
  case ".ts":
    RUNTIME = "ts-node";
    break;
  case ".js":
    RUNTIME = "node";
    break;
  default:
    log.error("Runner", `Unsupported file type: ${EXT} (expected .ts or .js)`);
    process.exit(1);
}

async function start() {
  await checkRequirements();

  if (!fs.existsSync(SCRIPT_TO_RUN)) {
    log.error("Runner", `File not found: ${SCRIPT_TO_RUN}`);
    process.exit(1);
  }

  log.info("Runner", `Starting ${SCRIPT_TO_RUN} with ${RUNTIME}`);

  const child = spawn(RUNTIME, [SCRIPT_TO_RUN, ...scriptArgs], {
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    log.info(
      "Exit",
      `Child exited (code=${code}, signal=${signal}). Restarting in 1s...`,
    );
    setTimeout(start, 1000);
  });

  child.on("error", (err) => {
    log.error("Failed to start child process", err);
  });
}

start();

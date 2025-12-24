import { exec } from "child_process";
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);

if (args.includes("--clean")) {
  const distPath = path.resolve(__dirname, "../dist");
  if (fs.existsSync(distPath)) {
    console.log("Cleaning dist folder...");
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log("dist folder deleted.");
  } else {
    console.log("No dist folder found to delete.");
  }
}

const start = Date.now();

exec("tsc", (err, stdout, stderr) => {
  const end = Date.now();
  const duration = ((end - start) / 1000).toFixed(2);

  console.log(stdout);
  console.log(`Build ${err ? "failed" : "success"} took ${duration} seconds`);
  if (err) process.exit(1);
});

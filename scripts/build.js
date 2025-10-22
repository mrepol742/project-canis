const { execSync, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

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

console.log("Build started at:", new Date().toLocaleTimeString());
const start = Date.now();

exec("tsc", (err, stdout, stderr) => {
  const end = Date.now();
  const duration = ((end - start) / 1000).toFixed(2);

  if (err) {
    console.error("Build failed:", stderr);
    process.exit(1);
  } else {
    console.log(stdout);
    console.log("Build finished at:", new Date().toLocaleTimeString());
    console.log(`Build took ${duration} seconds`);
  }
});

import fs from "fs";
import log from "./log";
import path from "path";
import cliProgress from "cli-progress";

function safeReadJSON(filePath: string) {
  try {
    return JSON.parse(
      fs.readFileSync(path.resolve(__dirname, filePath), "utf-8")
    );
  } catch (error) {
    log.error("Data", `Failed to read JSON from ${filePath}`, error);
    return [];
  }
}

const files: Record<string, string> = {
  greetings: "../../data/greetings.json",
  ball: "../../data/8ball.json",
  cat: "../../data/cat.json",
  dyk: "../../data/dyk.json",
  joke: "../../data/joke.json",
  quiz: "../../data/quiz.json",
  wyr: "../../data/wyr.json",
};

const progressBar = new cliProgress.SingleBar(
  {
    format: "Loading Data [{bar}] {percentage}% | {value}/{total} files",
  },
  cliProgress.Presets.shades_classic
);

progressBar.start(Object.keys(files).length, 0);

const data: Record<string, any> = {};
for (const [key, filePath] of Object.entries(files)) {
  data[key] = safeReadJSON(filePath);
  progressBar.increment();
}

progressBar.stop();

const { greetings, ball, cat, dyk, joke, quiz, wyr } = data;
export { greetings, ball, cat, dyk, joke, quiz, wyr };

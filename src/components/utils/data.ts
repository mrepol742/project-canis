import fs from "fs";
import log from "./log";
import path from "path";
import LoadingBar from "./loadingBar";

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
  errors: "../../data/errors.json",
};

const progressBar = LoadingBar(
  "Loading Data     | {bar} | {value}/{total} {filename}"
);

progressBar.start(Object.keys(files).length, 0, {
  filename: "",
});

const data: Record<string, any> = {};
for (const [key, filePath] of Object.entries(files)) {
  data[key] = safeReadJSON(filePath);
  progressBar.increment(1, { filename: path.basename(filePath) });
}

progressBar.stop();

const { greetings, ball, cat, dyk, joke, quiz, wyr, errors } = data;
export { greetings, ball, cat, dyk, joke, quiz, wyr, errors };

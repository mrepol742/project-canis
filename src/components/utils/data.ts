import fs from "fs";
import log from "./log";
import path from "path";

function safeReadJSON(filePath: string) {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), "utf-8"));
  } catch (error) {
    log.error("Data", `Failed to read JSON from ${filePath}`, error);
    return [];
  }
}

const greetings = safeReadJSON("../../data/greetings.json");
const ball = safeReadJSON("../../data/8ball.json");
const cat = safeReadJSON("../../data/cat.json");
const dyk = safeReadJSON("../../data/dyk.json");
const joke = safeReadJSON("../../data/joke.json");
const quiz = safeReadJSON("../../data/quiz.json");
const wyr = safeReadJSON("../../data/wyr.json");

export { ball, cat, dyk, joke, quiz, wyr, greetings };

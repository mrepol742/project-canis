"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wyr = exports.quiz = exports.joke = exports.dyk = exports.cat = exports.ball = exports.greetings = void 0;
const fs_1 = __importDefault(require("fs"));
const log_1 = __importDefault(require("./log"));
const path_1 = __importDefault(require("path"));
const cli_progress_1 = __importDefault(require("cli-progress"));
function safeReadJSON(filePath) {
    try {
        return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, filePath), "utf-8"));
    }
    catch (error) {
        log_1.default.error("Data", `Failed to read JSON from ${filePath}`, error);
        return [];
    }
}
const files = {
    greetings: "../../data/greetings.json",
    ball: "../../data/8ball.json",
    cat: "../../data/cat.json",
    dyk: "../../data/dyk.json",
    joke: "../../data/joke.json",
    quiz: "../../data/quiz.json",
    wyr: "../../data/wyr.json",
};
const progressBar = new cli_progress_1.default.SingleBar({
    format: "Loading Data [{bar}] {percentage}% | {value}/{total} files",
}, cli_progress_1.default.Presets.shades_classic);
progressBar.start(Object.keys(files).length, 0);
const data = {};
for (const [key, filePath] of Object.entries(files)) {
    data[key] = safeReadJSON(filePath);
    progressBar.increment();
}
progressBar.stop();
const { greetings, ball, cat, dyk, joke, quiz, wyr } = data;
exports.greetings = greetings;
exports.ball = ball;
exports.cat = cat;
exports.dyk = dyk;
exports.joke = joke;
exports.quiz = quiz;
exports.wyr = wyr;

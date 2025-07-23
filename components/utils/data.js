"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.greetings = exports.wyr = exports.quiz = exports.joke = exports.dyk = exports.cat = exports.ball = void 0;
const fs_1 = __importDefault(require("fs"));
const log_1 = __importDefault(require("./log"));
const path_1 = __importDefault(require("path"));
function safeReadJSON(filePath) {
    try {
        return JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, filePath), "utf-8"));
    }
    catch (error) {
        log_1.default.error("Data", `Failed to read JSON from ${filePath}`, error);
        return [];
    }
}
const greetings = safeReadJSON("../../data/greetings.json");
exports.greetings = greetings;
const ball = safeReadJSON("../../data/8ball.json");
exports.ball = ball;
const cat = safeReadJSON("../../data/cat.json");
exports.cat = cat;
const dyk = safeReadJSON("../../data/dyk.json");
exports.dyk = dyk;
const joke = safeReadJSON("../../data/joke.json");
exports.joke = joke;
const quiz = safeReadJSON("../../data/quiz.json");
exports.quiz = quiz;
const wyr = safeReadJSON("../../data/wyr.json");
exports.wyr = wyr;

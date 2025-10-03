import greetings from "../../data/greetings.json";
import ball from "../../data/8ball.json";
import cat from "../../data/cat.json";
import dyk from "../../data/dyk.json";
import joke from "../../data/joke.json";
import quiz from "../../data/quiz.json";
import wyr from "../../data/wyr.json";
import errors from "../../data/errors.json";
import riddles from "../../data/riddles.json";
import offensiveWords from "../../data/offensiveWords.json";

const done = [
  "Correct! 🎉",
  "Well done! 👍",
  "Nice job! ✅",
  "You got it! 🥳",
  "That's right! 👏",
  "Excellent! 🌟",
  "Great answer! 💡",
  "Spot on! 🎯",
  "Perfect! 🏆",
  "You nailed it! 🔥",
];
const wrong = [
  "Not quite! ❌",
  "Oops, try again! 🔄",
  "Close, but not correct. 🤔",
  "That's not it. 🚫",
  "Incorrect! ⚠️",
  "Give it another shot! 🎯",
  "Nope, not this time. 😅",
  "Almost, but not right. 🌀",
  "Sorry, that's wrong. 🙈",
  "Try once more! 🔁",
];
const personPronouns = ["he", "she", "him", "her", "they", "them"];

export {
  greetings,
  ball,
  cat,
  dyk,
  joke,
  quiz,
  wyr,
  errors,
  riddles,
  done,
  wrong,
  offensiveWords,
  personPronouns,
};

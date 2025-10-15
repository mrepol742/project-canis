import emojiRegex from "emoji-regex";

declare global {
  var _sharedEmoji: RegExp;
}

if (!global._sharedEmoji) {
  global._sharedEmoji = emojiRegex();
}

const emoji: RegExp = global._sharedEmoji;

export default emoji;

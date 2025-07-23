"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
exports.info = {
    command: "github",
    description: "Fetch GitHub user information.",
    usage: "github <username>",
    example: "github octocat",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^github\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a search query.");
        return;
    }
    if (query.includes(" ")) {
        await msg.reply("Please provide a single username without spaces.");
        return;
    }
    const response = await axios_1.default.get(`https://api.github.com/users/${query}`);
    const user = response.data;
    const info = `
      \`${user.name || user.login}\
      ${user.bio || ""}
  
      Place: ${user.location || "N/A"}
      Followers: ${user.followers}
      Following: ${user.following}
      Gists: ${user.public_gists}
      Repo: ${user.public_repos}
      X: ${user.twitter_username
        ? `https://twitter.com/${user.twitter_username}`
        : "N/A"}
      Link: ${user.blog || "N/A"}
  `;
    await msg.reply(info);
}

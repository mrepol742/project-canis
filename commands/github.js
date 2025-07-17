"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.role = exports.command = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const npmlog_1 = __importDefault(require("npmlog"));
exports.command = "github";
exports.role = "user";
async function default_1(msg) {
    const query = msg.body.replace(/^github\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a username.");
        return;
    }
    if (query.includes(" ")) {
        await msg.reply("Please provide a single username without spaces.");
        return;
    }
    await axios_1.default
        .get(`https://api.github.com/users/${query}`)
        .then(async (response) => {
        const user = response.data;
        const info = `
  *${user.name || user.login}*
  ${user.bio || ""}
  
  - Place: ${user.location || "N/A"}
  - Repos: ${user.public_repos}
  - Followers: ${user.followers}
  - Following: ${user.following}
  - Gists: ${user.public_gists}
  - Repo: ${user.public_repos}
  - X: ${user.twitter_username
            ? `https://twitter.com/${user.twitter_username}`
            : "N/A"}
  - Link: ${user.blog || "N/A"}
  `;
        await msg.reply(info);
    })
        .catch(async (error) => {
        npmlog_1.default.error("github", `Error fetching data: ${error.message}`);
        await msg.reply(`Error fetching data for "${query}". Please try again later.`);
        return;
    });
}

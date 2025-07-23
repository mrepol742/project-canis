"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
exports.info = {
    command: "docker",
    description: "Search for Docker repositories or users.",
    usage: "docker <username> | <username/repository>",
    example: "docker mrepol742/project-canis",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^docker\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a search query.");
        return;
    }
    if (query.includes(" ")) {
        await msg.reply("Please provide a username or single repository name without spaces.");
        return;
    }
    const response = await axios_1.default.get(`https://hub.docker.com/v2/repositories/${query}`);
    if (response.data.count === 0 || response.data.message) {
        await msg.reply(`No repositories found for "${query}".`);
        return;
    }
    if (!query.includes("/")) {
        const repos = response.data.results;
        if (!repos || repos.length === 0) {
            await msg.reply(`No repositories found for user "${query}".`);
            return;
        }
        let reply = `*${query}*\n\n`;
        reply += repos
            .map((repo) => `\`${repo.name}\`
              \nStars: ${repo.star_count} Pulls: ${repo.pull_count}`)
            .join("\n\n");
        await msg.reply(reply);
        return;
    }
    const repo = response.data;
    const info = `
      \`${repo.name}\`
      ${repo.description || ""}

      Stars: ${repo.star_count}
      Pulls: ${repo.pull_count}
      Last Updated: ${new Date(repo.last_updated).toLocaleDateString()}
      Link: https://hub.docker.com/r/${repo.namespace}/${repo.name}
      `;
    await msg.reply(info);
}

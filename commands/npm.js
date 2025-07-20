"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = exports.role = exports.command = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const log_1 = __importDefault(require("../components/utils/log"));
exports.command = "npm";
exports.role = "user";
exports.info = {
    command: "npm",
    description: "Search for npm package information.",
    usage: "npm <package-name>",
    example: "npm express",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^(npm(?:\s+install)?)\s+/i, "").trim();
    if (query.includes(" "))
        return;
    if (query.length === 0) {
        await msg.reply("Please provide a search query.");
        return;
    }
    await axios_1.default
        .get(`https://api.popcat.xyz/npm?q=${encodeURIComponent(query)}`)
        .then(async (response) => {
        const name = response.data.name;
        const version = response.data.version;
        const description = response.data.description;
        const author = response.data.author;
        const last_published = response.data.last_published;
        const downloads_this_year = response.data.downloads_this_year;
        const repository = response.data.repository;
        const author_email = response.data.author_email;
        const repo = `
     *${name}*
     ${version}
     ${description}

     - Author: ${author}
     - Email: ${author_email}
     - Last Updated: ${last_published}
     - Repository: ${repository}
     - Downloads This Year: ${downloads_this_year}
 `;
        await msg.reply(repo);
    })
        .catch(async (error) => {
        log_1.default.error("npm", `Error fetching data: ${error.message}`);
        await msg.reply(`Error fetching data "${query}". Please try again later.`);
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
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
    if (query.length === 0) {
        await msg.reply("Please provide a search query.");
        return;
    }
    if (query.includes(" ")) {
        await msg.reply("Please provide a single package name without spaces.");
        return;
    }
    const response = await axios_1.default.get(`https://registry.npmjs.org/${encodeURIComponent(query)}`);
    const data = response.data;
    if (data.error)
        return await msg.reply(`No package found for "${query}".`);
    const latestVersion = data["dist-tags"]?.latest;
    const versionData = latestVersion ? data.versions[latestVersion] : null;
    if (!versionData) {
        await msg.reply(`No data found for package "${query}".`);
        return;
    }
    const name = data.name || "-";
    const version = versionData.version || "-";
    const description = versionData.description || "-";
    const author = versionData.author?.name || "-";
    const homepage = versionData.homepage || "-";
    const repository = versionData.repository?.url || "-";
    const license = versionData.license || "-";
    const lastPublished = data.time?.[latestVersion] || "-";
    let formattedPublished = "-";
    if (lastPublished && lastPublished !== "-") {
        const date = new Date(lastPublished);
        formattedPublished = date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }
    const repo = `
    \`${name}* (v${version})\`
    ${description}

    Author: ${author}
    License: ${license}
    Homepage: ${homepage}
    Repository: ${repository}
    Last Published: ${formattedPublished}
    `;
    await msg.reply(repo);
}

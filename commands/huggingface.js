"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const axios_1 = __importDefault(require("axios"));
const log_1 = __importDefault(require("../components/utils/log"));
exports.info = {
    command: "huggingface",
    description: "Search for models on Hugging Face.",
    usage: "huggingface <query>",
    example: "huggingface gpt-2",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^huggingface\b\s*/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a search query.");
        return;
    }
    await axios_1.default
        .get(`https://huggingface.co/api/models?search=${query}`)
        .then(async (response) => {
        if (response.data.length === 0) {
            await msg.reply(`No models found for "${query}".`);
            return;
        }
        const models = response.data[0];
        const info = `
      \`${models.modelId}\`
      ${models.tags.splice(0, 5).join(", ") || "N/A"}

      Library: ${models.library_name}
      Pipeline: ${models.pipeline_tag}
      Likes: ${models.likes}
      Downloads: ${models.downloads}
      Created At: ${new Date(models.createdAt).toLocaleString()}
      Private: ${models.private ? "Yes" : "No"}
      Model URL: https://huggingface.co/${models.modelId}
      `;
        await msg.reply(info);
    })
        .catch(async (error) => {
        if (error.response && error.response.status === 404) {
            await msg.reply(`No models found for "${query}".`);
            return;
        }
        log_1.default.error("huggingface", `Error fetching data: ${error.message}`);
        await msg.reply(`Error fetching data for "${query}". Please try again later.`);
        return;
    });
}

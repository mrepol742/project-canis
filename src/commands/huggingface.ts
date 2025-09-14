import { Message } from "../../types/message"
import axios from "../components/axios";
import log from "../components/utils/log";

export const info = {
  command: "huggingface",
  description: "Search for models on Hugging Face.",
  usage: "huggingface <query>",
  example: "huggingface gpt-2",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^huggingface\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const response = await axios.get(
    `https://huggingface.co/api/models?search=${query}`
  );

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
}

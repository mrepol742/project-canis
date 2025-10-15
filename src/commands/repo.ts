import { Message } from "../types/message"
import axios from "../components/axios";
import { download } from "../components/utils/download";
import log from "../components/utils/log";

export const info = {
  command: "repo",
  description: "Search for GitHub repositories.",
  usage: "repo <username/repository>",
  example: "repo mrepol742/project-canis",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^repo\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const response = await axios.get(`https://api.github.com/repos/${query}`);

  if (response.data.message) {
    await msg.reply(`No repository found for "${query}".`);
    return;
  }
  const repo = response.data;
  const downloadAvatar = await download(repo.owner.avatar_url, ".png");

  const info = `
    \`${repo.name}\`
    ${repo.description.substring(0, 100) || "No description available."}

    Stars: ${repo.stargazers_count}
    Forks: ${repo.forks_count}
    Open Issues: ${repo.open_issues_count}
    Watchers: ${repo.watchers_count}
    Stargazers: ${repo.stargazers_count}
    Language:${repo.language || "N/A"}
    License: ${repo.license ? repo.license.name : "N/A"}
    Is Fork: ${repo.fork ? "Yes" : "No"}
    Is Template: ${repo.is_template ? "Yes" : "No"}
    Is Archived: ${repo.archived ? "Yes" : "No"}
    Is Disabled: ${repo.disabled ? "Yes" : "No"}
    Allow Forking: ${repo.allow_forking ? "Yes" : "No"}
    Default Branch: ${repo.default_branch}
    Created At: ${new Date(repo.created_at).toLocaleDateString()}
    Updated At: ${new Date(repo.updated_at).toLocaleDateString()}
  `;
  await msg.reply(downloadAvatar, undefined, { caption: info });
}

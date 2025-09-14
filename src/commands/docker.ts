import { Message } from "../../types/message"
import axios from "../components/axios";
import log from "../components/utils/log";

export const info = {
  command: "docker",
  description: "Search for Docker repositories or users.",
  usage: "docker <username> | <username/repository>",
  example: "docker mrepol742/project-canis",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^docker\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  if (query.includes(" ")) {
    await msg.reply(
      "Please provide a username or single repository name without spaces."
    );
    return;
  }

  const response = await axios.get(
    `https://hub.docker.com/v2/repositories/${query}`
  );

  if (response.data.count === 0 || response.data.message) {
    await msg.reply(`No repositories found for "${query}".`);
    return;
  }
  if (!query.includes("/")) {
    // The response is a list of repositories for the user
    const repos = response.data.results;
    if (!repos || repos.length === 0) {
      await msg.reply(`No repositories found for user "${query}".`);
      return;
    }
    let reply = `*${query}*\n\n`;
    reply += repos
      .map(
        (repo: any) =>
          `\`${repo.name}\`
              \nStars: ${repo.star_count} Pulls: ${repo.pull_count}`
      )
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

import { Message } from "../types/message"
import axios from "../components/axios";
import { download } from "../components/utils/download";

export const info = {
  command: "github",
  description: "Fetch GitHub user information.",
  usage: "github <username>",
  example: "github octocat",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^github\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  if (query.includes("/")) {
    await msg.reply(
      "If you want to get repository info, please use the `repo` command.",
    );
    return;
  }

  if (query.includes(" ")) {
    await msg.reply("Please provide a single username without spaces.");
    return;
  }

  const response = await axios.get(`https://api.github.com/users/${query}`);

  const user = response.data;
  const downloadAvatar = await download(user.avatar_url, ".png");

  const info = `
    \`${user.name || user.login}\`
    ${user.bio ?? ""}

    Place: ${user.location ?? "N/A"}
    Followers: ${user.followers}
    Following: ${user.following}
    Gists: ${user.public_gists}
    Repo: ${user.public_repos}
    X: ${
      user.twitter_username
        ? `https://twitter.com/${user.twitter_username}`
        : "N/A"
    }
    Link: ${user.blog ?? "N/A"}
  `;
  await msg.reply(downloadAvatar, undefined, {
    caption: info,
  });
}

import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";
import fs from "fs/promises";
import { client } from "../index";

export const command = "github";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^github\s+/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a username.");
    return;
  }

  const response = await axios.get(`https://api.github.com/users/${query}`);
  const user = response.data;
  const info = `
*GitHub User Info:*
- Name: ${user.name || user.login}
- Bio: ${user.bio || "N/A"}
- Location: ${user.location || "N/A"}
- Public Repos: ${user.public_repos}
- Followers: ${user.followers}
- Following: ${user.following}
- Public Gists: ${user.public_gists}
- Public Repo: ${user.public_repos}
- Twitter: ${
    user.twitter_username
      ? `https://twitter.com/${user.twitter_username}`
      : "N/A"
  }
- Blog: ${user.blog || "N/A"}
`;

  await msg.reply(info);
}

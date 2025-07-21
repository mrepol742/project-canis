import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const info = {
  command: "github",
  description: "Fetch GitHub user information.",
  usage: "github <username>",
  example: "github octocat",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^github\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  if (query.includes(" ")) {
    await msg.reply("Please provide a single username without spaces.");
    return;
  }

  await axios
    .get(`https://api.github.com/users/${query}`)
    .then(async (response) => {
      const user = response.data;
      const info = `
      \`${user.name || user.login}\
      ${user.bio || ""}
  
      Place: ${user.location || "N/A"}
      Followers: ${user.followers}
      Following: ${user.following}
      Gists: ${user.public_gists}
      Repo: ${user.public_repos}
      X: ${
        user.twitter_username
          ? `https://twitter.com/${user.twitter_username}`
          : "N/A"
      }
      Link: ${user.blog || "N/A"}
  `;

      await msg.reply(info);
    })
    .catch(async (error) => {
      log.error("github", `Error fetching data: ${error.message}`);
      await msg.reply(
        `Error fetching data for "${query}". Please try again later.`
      );
      return;
    });
}

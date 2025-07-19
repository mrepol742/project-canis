import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const command = "npm";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^npm\b\s*/i, "").trim();
  if (query.includes(" ")) return;
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  await axios
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
      log.error("npm", `Error fetching data: ${error.message}`);
      await msg.reply(
        `Error fetching data "${query}". Please try again later.`
      );
    });
}

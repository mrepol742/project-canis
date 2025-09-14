import { Message } from "../../types/message"
import axios from "../components/axios";
import log from "../components/utils/log";

export const info = {
  command: "duckduckgo",
  description: "Search with duckduckgo.",
  usage: "duckduckgo <query>",
  example: "duckduckgo weather today",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^duckduckgo\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const response = await axios.get("https://api.duckduckgo.com/", {
    params: {
      q: query,
      format: "json",
      pretty: 1,
      no_redirect: 1,
      no_html: 1,
    },
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const data = response.data;
  if (data.AbstractText) {
    await msg.reply(`${data.AbstractText}\n\n${data.AbstractURL}`);
    return;
  }

  // If no abstract, try to get the first related topic
  if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
    const firstTopic =
      data.RelatedTopics.find(
        (t: any) => typeof t.Text === "string" && t.FirstURL
      ) || data.RelatedTopics[0];

    if (firstTopic && firstTopic.Text && firstTopic.FirstURL) {
      await msg.reply(`${firstTopic.Text}\n${firstTopic.FirstURL}`);
      return;
    }
  }

  // Fallback
  const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  await msg.reply(
    `Why dont you duckduck it yourself? Heres the link: \n${searchUrl}`
  );
}

import { Message } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";

export const command = "go";

export default async function (msg: Message) {
  const query = msg.body.replace(/^go\s+/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a search query.");
    return;
  }
  
  try {
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
      await msg.reply(`${data.AbstractText}\n${data.AbstractURL}`);
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
    await msg.reply(`DuckDuckGo search results for "${query}":\n${searchUrl}`);
  } catch (error) {
    log.error("GoCommand", "Error fetching DuckDuckGo results:", error);
    await msg.reply("Failed to search DuckDuckGo.");
  }
}

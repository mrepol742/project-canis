import { Message } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";

export const command = "wiki";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^wiki\s+/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a search query.");
    return;
  }

  try {
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);

    const data = response.data;
    const title = data.title || query;
    const description = data.description ? `(${data.description})` : "";
    const extract = data.extract || "No summary available.";

    await msg.reply(`${title} ${description}\n${extract}`);
  } catch (error) {
    log.error("Command", "Error fetching wikipedia:", error);
    await msg.reply("Failed to fetch wikipedia.");
  }
}

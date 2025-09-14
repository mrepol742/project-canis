import { Message } from "../../types/message"
import axios from "../components/axios";
import log from "../components/utils/log";

export const info = {
  command: "wiki",
  description: "Search Wikipedia for a summary of a topic.",
  usage: "wiki <query>",
  example: "wiki JavaScript",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^wiki\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const response = await axios.get(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      query
    )}`
  );

  const data = response.data;
  const title = data.title || query;
  const description = data.description ? `(${data.description})` : "";
  const extract = data.extract || "No summary available.";
  const text = `
      \`${title}\`
      ${description}

      ${extract}
      `;
  await msg.reply(text);
}

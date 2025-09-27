import { Message } from "../../types/message";
// for i dont know reasons
// using the ESM outputs to Client not found
// so i recommend using `require` for now...
// it works
const Genius = require("genius-lyrics");
import log from "../components/utils/log";
import { request } from "undici";

export const info = {
  command: "lyrics",
  description: "Get a lyrics from a song.",
  usage: "lyrics <song title>",
  example: "lyrics rchp sick love",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^lyrics\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const client = new Genius.Client();
  const origGet = client.request.get.bind(client.request);

  client.request.get = async (url: string): Promise<string> => {
    const res = await request(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    return await res.body.text();
  };
  const searches = await client.songs.search(query);

  if (!searches || searches.length == 0) {
    await msg.reply("Unable to find resources for the given query.");
    return;
  }

  const firstSong = searches[0];

  let lyrics: string;
  try {
    lyrics = await firstSong.lyrics();
  } catch (err: any) {
    await msg.reply("Could not fetch lyrics (possibly blocked by Genius).");
    return;
  }

  const text = `
    \`${firstSong.fullTitle}\`

    ${lyrics}
  `;
  await msg.reply(text);
}

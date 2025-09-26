import { Message } from "../../types/message"
import axios from "../components/axios";
import log from "../components/utils/log";

export const info = {
  command: "bible",
  description: "Fetch a Bible verse or the verse of the day.",
  usage: "bible --random | --today | --verse <book chapter:verse>",
  example: "bible --verse Job 4:9",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^bible\b\s*/i, "").trim();

  if (!/^--(random|today|verse(\s+\w+\s*\d+:\d+)?)$/i.test(query)) {
    await msg.reply(
      "Invalid argument. Please use one of the following:\n\n- bible --random\n- bible --today\n- bible --verse Job 4:9"
    );
    return;
  }

  let parameter: string;
  if (query === "--random") {
    parameter = "random";
  } else if (query === "--today") {
    parameter = "votd";
  } else {
    parameter = query.replace("--verse ", "").trim();
  }

  const response = await axios.get(`https://labs.bible.org/api/`, {
    params: {
      passage: parameter,
      type: "json",
    },
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const data = response.data;

  if (!Array.isArray(data) || data.length === 0) {
    await msg.reply("No verse found for your query.");
    return;
  }

  const v = data[0];
  const verses = `
    *${v.bookname} ${v.chapter}:${v.verse}*

    ${v.text.trim()}
  `;

  await msg.reply(verses);
}

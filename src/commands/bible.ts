import { Message } from "whatsapp-web.js";
import axios from "axios";
import log from "npmlog";

export const command = "bible";
export const role = "user";

export default async function (msg: Message) {
  const query = msg.body.replace(/^bible\s+/i, "").trim();

  if (!["--random", "--today", "--verse"].includes(query)) {
    await msg.reply(
      "Invalid argument. Please use one of the following:\n- bible --random\n- bible --today\n- bible --verse job 4L9"
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
  const verses = `${v.bookname} ${v.chapter}:${v.verse} - ${v.text.trim()}`;

  await msg.reply(verses);
}

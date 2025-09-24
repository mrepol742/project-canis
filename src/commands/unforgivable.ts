import { Message } from "../../types/message";
import axios from "../components/axios";
import { download } from "../components/utils/download";

export const info = {
  command: "unforgivable",
  description: "Generate a unforgivable image with the provided text.",
  usage: "unforgivable <text>",
  example: "unforgivable how to sleep 6 hours in 2 hours",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^unforgivable\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  const downloadedFile = await download(
    `https://api.popcat.xyz/unforgivable?text=${encodeURIComponent(query)}`,
    ".png",
  );
  await msg.reply(downloadedFile);
}

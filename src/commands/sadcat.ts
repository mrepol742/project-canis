import { Message } from "../../types/message";
import { download } from "../components/utils/download";

export const info = {
  command: "sadcat",
  description: "Generate a sad cat image with the provided text.",
  usage: "sadcat <text>",
  example: "sadcat I miss you",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^sadcat\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  const downloadedFile = await download(
    `https://api.popcat.xyz/sadcat?text=${encodeURIComponent(query)}`,
    ".png",
  );
  await msg.reply(downloadedFile);
}

import { Message } from "../../types/message";
import { download } from "../components/utils/download";

export const info = {
  command: "alert",
  description: "Generate an alert image with the provided text.",
  usage: "alert <text>",
  example: "alert This is an important message!",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^alert\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  const downloadedFile = await download(
    `https://api.popcat.xyz/alert?text=${encodeURIComponent(query)}`,
    ".png",
  );
  await msg.reply(downloadedFile);
}

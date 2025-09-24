import { Message } from "../../types/message"
import { download } from "../components/utils/download";

export const info = {
  command: "meme",
  description: "Fetch a random meme image.",
  usage: "meme",
  example: "meme",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^meme$/i.test(msg.body)) return;

  const downloadedFile = await download(
    "https://api.popcat.xyz/meme",
    ".png",
  );
  await msg.reply(downloadedFile);
}

import { Message } from "../types/message"
import { download } from "../components/utils/download"

export const info = {
  command: "caution",
  description: "Generate a caution image with the provided text.",
  usage: "caution <text>",
  example: "caution This is a caution message!",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^caution\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  const downloadedFile = await download(`https://api.popcat.xyz/caution?text=${encodeURIComponent(query)}`, ".png");
  await msg.reply(downloadedFile)
}

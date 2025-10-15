import { Message } from "../types/message"
import { download } from "../components/utils/download";

export const info = {
  command: "pooh",
  description: "Generate a Pooh image with two texts.",
  usage: "pooh <text1> | <text2>",
  example: "pooh I love you | I love you too",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const args = msg.body
    .replace(/^pooh\b\s*/i, "")
    .trim()
    .split("|")
    .map((s) => s.trim());
  if (args.length < 2 || !args[0] || !args[1]) {
    await msg.reply(
      "Please provide two texts separated by '|'. Example: pooh text1 | text2",
    );
    return;
  }
  const [text1, text2] = args;

  const downloadedFile = await download(
    `https://api.popcat.xyz/pooh?text1=${encodeURIComponent(
      text1,
    )}&text2=${encodeURIComponent(text2)}`,
    ".png",
  );
  await msg.reply(downloadedFile);
}

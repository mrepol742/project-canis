import { Message } from "../types/message"
import axios from "../components/axios";
import { download } from "../components/utils/download";

export const info = {
  command: "randomcolor",
  description: "Generate a random color with its name and hex code.",
  usage: "randomcolor",
  example: "randomcolor",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const response = await axios.get(`https://api.popcat.xyz/randomcolor`);

  const data = response.data;
  const downloadedFile = await download(data.image, ".png");

  const color = `
    \`${data.name}\`

    ${data.hex}
  `;
  await msg.reply(downloadedFile, undefined, { caption: color });
}

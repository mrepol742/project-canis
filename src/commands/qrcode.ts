import { Message } from "../types/message"
import { download } from "../components/utils/download";

export const info = {
  command: "qrcode",
  description: "Generate a QR code from the provided text.",
  usage: "qrcode <text>",
  example: "qrcode https://example.com",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^qrcode\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a text.");
    return;
  }

  const downloadedFile = await download(
    `https://api.qrserver.com/v1/create-qr-code/?150x150&data=${encodeURIComponent(
      query,
    )}`,
    ".png",
  );
  await msg.reply(downloadedFile);
}

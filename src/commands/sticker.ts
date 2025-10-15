import { Message } from "../types/message"

export const info = {
  command: "sticker",
  description: "Convert an image or short video to a sticker.",
  usage: "sticker",
  example: "sticker",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!/^sticker$/.test(msg.body)) return;

  const quoted = await msg.getQuotedMessage();
  const targetMsg = msg.hasMedia
    ? msg
    : quoted && quoted.hasMedia
      ? quoted
      : null;

  if (!targetMsg) {
    await msg.reply(
      "Please send or reply to an image/video to convert into a sticker.",
    );
    return;
  }

  const media = await targetMsg.downloadMedia();
  if (!media || !media.mimetype) {
    await msg.reply("Failed to download media.");
    return;
  }

  if (
    !media.mimetype.startsWith("image/") &&
    !media.mimetype.startsWith("video/")
  ) {
    await msg.reply(
      "Only images or short videos can be converted to stickers.",
    );
    return;
  }

  await msg.reply(media, undefined, {
    sendMediaAsSticker: true,
    stickerAuthor: process.env.PROJECT_CANIS_ALIAS || "Canis",
    stickerName: "Sticker",
  });
}

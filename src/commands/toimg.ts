import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../types/message"
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export const info = {
  command: "toimg",
  description: "Convert a sticker back to an image.",
  usage: "toimg",
  example: "toimg",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const quoted = await msg.getQuotedMessage();
  const targetMsg = msg.hasMedia
    ? msg
    : quoted && quoted.hasMedia
      ? quoted
      : null;

  if (!targetMsg) {
    await msg.reply("Please reply to a sticker to convert it to an image.");
    return;
  }

  const media = await targetMsg.downloadMedia();
  if (!media || !media.mimetype) {
    await msg.reply("Failed to download sticker.");
    return;
  }

  if (!media.mimetype.includes("webp")) {
    await msg.reply(
      "That doesn't look like a sticker. Please reply to a sticker.",
    );
    return;
  }

  const tempDir = "./.temp";
  await fs.promises.mkdir(tempDir, { recursive: true });

  const baseName =
    media.filename?.replace(/\.[^/.]+$/, "") || `sticker_${Date.now()}`;
  const inputPath = path.join(tempDir, `${baseName}.webp`);
  const outputPath = path.join(tempDir, `${baseName}.png`);

  if (fs.existsSync(outputPath)) {
    console.log(`[CACHE] Using existing file: ${outputPath}`);

    const pngBuffer = await fs.promises.readFile(outputPath);
    const messageMedia = new MessageMedia(
      "image/png",
      pngBuffer.toString("base64"),
      "sticker.png",
    );

    await msg.reply(messageMedia, undefined, {
      caption: "Here's the image from the sticker.",
    });
    return;
  }

  await fs.promises.writeFile(inputPath, Buffer.from(media.data, "base64"));

  await execPromise(`ffmpeg -y -i "${inputPath}" "${outputPath}"`);
  const pngBuffer = await fs.promises.readFile(outputPath);
  const messageMedia = new MessageMedia(
    "image/png",
    pngBuffer.toString("base64"),
    "sticker.png",
  );

  await msg.reply(messageMedia, undefined, {
    caption: "Here's the image from the sticker.",
  });
}

import { Message } from "../../../types/message";
import path from "path";
import fs from "fs";
import log from "../log";
import { addMessage } from "../../services/message";
import {
  PROJECT_AUTO_DOWNLOAD_MEDIA,
  PROJECT_MAX_DOWNLOAD_MEDIA,
} from "../../../config";

export default async function (msg: Message): Promise<void> {
  // msg type unknown to ignore group mention statuses
  if (
    msg.isStatus ||
    msg.broadcast ||
    msg.isForwarded ||
    !msg.hasMedia ||
    msg.fromMe ||
    msg.type === "unknown" ||
    !PROJECT_AUTO_DOWNLOAD_MEDIA
  )
    return;

  // ignore @Meta AI and others
  if (msg.author && msg.author.split("@")[1] === "bot") return;

  const media = await msg.downloadMedia();
  if (!media) return;

  if (
    media.filesize &&
    media.filesize > PROJECT_MAX_DOWNLOAD_MEDIA * 1024 * 1024
  ) {
    log.warn(
      "MediaDownload",
      `The file is too large to be saved: ${media.filename}`,
    );

    msg.body = `${msg.body}

      \`System\`
      This messages includes the media that was not saved.
      Filename: ${media.filename ?? "unknown"}
      Filesize: ${media.filesize ? media.filesize / 1024 : "unknown"}
      Mimetype: ${media.mimetype}
    `;
  }

  const mediaID = msg.id.id;
  const downloadsDir = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    ".downloads",
  );
  fs.mkdirSync(downloadsDir, { recursive: true });

  const ext = media.mimetype.split("/")[1].split(";")[0];
  const download_filename = `media_${mediaID}.${ext}`;
  const filePath = path.join(downloadsDir, download_filename);

  fs.writeFile(filePath, Buffer.from(media.data, "base64"), (err) => {
    if (err) {
      log.error("MediaDownload", "Error saving media:", err);
    } else {
      log.info("MediaDownload", `Media saved in: ${filePath}`);
    }
  });

  addMessage(
    mediaID,
    JSON.stringify({
      file: true,
      download_filename,
      filename: media.filename ?? "",
      filesize: media.filesize ?? null,
      body: msg.body,
    }),
    "media",
  );
}

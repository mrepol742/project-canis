import { MessageMedia } from "whatsapp-web.js";
import { getFbVideoInfo } from "fb-downloader-scrapper";
import crypto from "crypto";
import axios from "../../axios";
import fs from "fs";
import { Video } from "./downloader";
import { fileExists } from "../file";

function md5FromUrl(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex");
}

export async function FacebookInstantDownloader(
  query: string,
): Promise<Video | undefined> {
  const result = await getFbVideoInfo(query);
  if (!result.url) return undefined;

  const tempDir = "./.temp";
  fs.mkdirSync(tempDir, { recursive: true });
  const tempPath = `${tempDir}/${md5FromUrl(result.url)}.mp4`;

  if (await fileExists(tempPath)) {
    return {
      video: MessageMedia.fromFilePath(tempPath),
      title: result.title,
    };
  }

  const response = await axios.get(result.hd || result.sd, {
    responseType: "arraybuffer",
  });
  fs.writeFileSync(tempPath, response.data);

  return {
    video: MessageMedia.fromFilePath(tempPath),
    title: result.title,
  };
}

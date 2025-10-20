import { MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import { Innertube, UniversalCache, Utils } from "youtubei.js";
import { Video } from "./downloader";
import { fileExists } from "../file";

export async function YoutubeShortsInstantDownloader(
  query: string,
): Promise<Video | undefined> {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
    player_id: "0004de42",
  });

  const endpoint = await yt.resolveURL(query);
  const videoId = endpoint.payload.videoId;
  if (!videoId) return undefined;

  const tempDir = "./.temp";
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `${videoId}.mp4`);

  if (await fileExists(tempPath)) {
    return {
      video: MessageMedia.fromFilePath(tempPath),
      title: undefined,
    };
  }

  const stream = await yt.download(videoId, {
    type: "video+audio",
    quality: "best",
    format: "mp4",
  });

  if (!stream) return undefined;

  let writeStream = fs.createWriteStream(tempPath);

  for await (const chunk of Utils.streamToIterable(stream)) {
    writeStream.write(chunk);
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end();
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return {
    video: MessageMedia.fromFilePath(tempPath),
    title: undefined,
  };
}

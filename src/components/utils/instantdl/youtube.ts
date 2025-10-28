import { MessageMedia } from "whatsapp-web.js";
import fs from "fs";
import path from "path";
import { Innertube, UniversalCache, Platform, Types, Utils } from "youtubei.js";
import { Video } from "./downloader";
import { fileExists } from "../file";
import log from "../log";

Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>,
) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`;

  return new Function(code)();
};

async function safeDownload(
  yt: Innertube,
  id: string,
  options: Types.DownloadOptions,
  retries = 3,
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const stream = await yt.download(id, options);
      return stream;
    } catch (err) {
      log.error(
        "InstantDownload",
        `Download failed (attempt ${attempt}/${retries}):`,
        err,
      );
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

export async function YoutubeShortsInstantDownloader(
  query: string,
): Promise<Video | undefined> {
  const yt = await Innertube.create({
    cache: new UniversalCache(false),
    generate_session_locally: true,
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

  const stream = await safeDownload(yt, videoId, {
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

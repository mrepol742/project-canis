import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../types/message";
import fs from "fs";
import path from "path";
import { Innertube, UniversalCache, Platform, Types, Utils } from "youtubei.js";
import log from "../components/utils/log";
import { DownloadOptions } from "youtubei.js/dist/src/types";
import { fileExists } from "../components/utils/file";

export const info = {
  command: "video",
  description: "Searches and returns a video based on your query or url.",
  usage: "video <query>",
  example: "video Never Gonna Give You Up",
  role: "user",
  cooldown: 5000,
};

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
  options: DownloadOptions,
  retries = 3,
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const stream = await yt.download(id, options);
      return stream;
    } catch (err) {
      log.error(
        "PlayDownload",
        `Download failed (attempt ${attempt}/${retries}):`,
        err,
      );
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function search(yt: Innertube, query: string) {
  log.info("Video", `Searching for ${query}`);
  const results = await yt.search(query, { type: "video" });
  const video: any = results.results?.[0];

  if (video?.video_id) return video;

  const didYouMean: any = results.results?.[0];
  if (!didYouMean) return undefined;

  log.info("Video", `Did you mean ${didYouMean.corrected_query.text}`);
  return await search(yt, didYouMean.corrected_query.text);
}

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^video\b\s*/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const yt = await Innertube.create({
    cache: new UniversalCache(true, "./.youtubei"),
    generate_session_locally: true,
  });

  const [video] = await Promise.all([search(yt, query), msg.react("🔍")]);
  if (!video) {
    await msg.reply(`No youtube video found for "${query}".`);
    return;
  }

  // Only allow audios shorter than 20 minutes (1200 seconds)
  if (video.duration && video.duration.seconds > 1200) {
    await Promise.all([
      msg.reply(
        "Opps, the video is quite long we can only process max of 20 minutes.",
      ),
      msg.react(""),
    ]);
    return;
  }

  const tempDir = "./.temp";
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `${video.video_id}.mp4`);

  if (await fileExists(tempPath)) {
    const media = MessageMedia.fromFilePath(tempPath);

    await Promise.all([
      msg.reply(media, undefined, {
        caption: video.title.text,
      }),
      msg.react(""),
    ]);
    return;
  }

  const [stream] = await Promise.all([
    safeDownload(yt, video.video_id, {
      type: "video+audio",
      quality: "best",
      format: "mp4",
    }),
    msg.react("⬇️"),
  ]);

  if (!stream) {
    await Promise.all([
      msg.reply("Failed to download the video."),
      msg.react(""),
    ]);
    return;
  }

  let writeStream = fs.createWriteStream(tempPath);
  for await (const chunk of Utils.streamToIterable(stream)) {
    if (!writeStream.write(chunk)) {
      await new Promise<void>((resolve) =>
        writeStream.once("drain", () => resolve()),
      );
    }
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end();
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  const media = MessageMedia.fromFilePath(tempPath);
  await msg.reply(media, undefined, {
    caption: video.title.text,
  });
}

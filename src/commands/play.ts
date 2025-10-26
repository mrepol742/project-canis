import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../types/message";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Innertube, UniversalCache, Utils, Platform, Types } from "youtubei.js";
import util from "util";
import log from "../components/utils/log";
import { fileExists } from "../components/utils/file";

const execPromise = util.promisify(exec);

export const info = {
  command: "play",
  description: "Searches and returns a music based on your query or url.",
  usage: "play <query>",
  example: "play Never Gonna Give You Up",
  role: "user",
  cooldown: 5000,
};

<<<<<<< HEAD
=======
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

>>>>>>> upstream/master
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
  log.info("Play", `Searching for ${query}`);
  const results = await yt.music.search(query, { type: "song" });
  const firstShelf = results.contents?.[0];
  const audio: any =
    firstShelf && "contents" in firstShelf
      ? firstShelf.contents?.[0]
      : undefined;

  if (audio?.id) return audio;

  const didYouMean: any = results.contents?.[0].contents?.[0];
  if (!didYouMean) return undefined;

  log.info("Play", `Did you mean ${didYouMean.corrected_query.text}`);
  return await search(yt, didYouMean.corrected_query.text);
}

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^play\b\s*/i, "").trim();
  if (!query) {
    await msg.reply("Please provide a search query.");
    return;
  }

  const yt = await Innertube.create({
    cache: new UniversalCache(true, "./.youtubei"),
    generate_session_locally: true,
  });

  const [audio] = await Promise.all([search(yt, query), msg.react("🔍")]);
  if (!audio) {
    await msg.reply(`No youtube music found for "${query}".`);
    return;
  }

  // Only allow audios shorter than 20 minutes (1200 seconds)
  if (audio.duration && audio.duration.seconds > 1200) {
    await Promise.all([
      msg.reply(
        "Opps, the music is quite long we can only process max of 20 minutes.",
      ),
      msg.react(""),
    ]);
    return;
  }

  const tempDir = "./.temp";
  await fs.promises.mkdir(tempDir, { recursive: true });
  const tempPath = path.join(tempDir, `${audio.id}.mp3`);
  const savePath = path.join(tempDir, `${audio.id}.m4a`);

  if (await fileExists(savePath)) {
    const media = MessageMedia.fromFilePath(savePath);
    await Promise.all([msg.reply(media), msg.react("")]);
    return;
  }

  const [stream] = await Promise.all([
    safeDownload(yt, audio.id, {
      type: "video+audio",
      quality: "best",
      format: "mp4",
    }),
    msg.react("⬇️"),
  ]);

  if (!stream) {
    await Promise.all([
      msg.reply("Failed to download the audio."),
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

  await execPromise(`ffmpeg -y -i "${tempPath}" -vn -c:a copy "${savePath}"`);
  const media = MessageMedia.fromFilePath(savePath);
  Promise.all([msg.reply(media), fs.promises.unlink(tempPath)]);
}

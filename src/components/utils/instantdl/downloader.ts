import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../../../types/message";
import { FacebookInstantDownloader } from "./facebook";
import { YoutubeShortsInstantDownloader } from "./youtube";
import log from "../log";
import crypto from "crypto";
import redis from "../../redis";

export interface Video {
  video: MessageMedia;
  title: string | undefined;
}

function md5FromUrl(url: string) {
  return crypto.createHash("md5").update(url).digest("hex");
}

const facebookUrlRegex =
  /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s?#]+(\?[^\s#]*)?(#[^\s]*)?$/i;
const youtubeShortsUrlRegex =
  /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(\?[^\s#]*)?(#[^\s]*)?$/i;

export async function InstantDownloader(msg: Message) {
  try {
    const query = msg.body;
    const key = `instantdownload:${md5FromUrl(query)}`;

    if (facebookUrlRegex.test(query) || youtubeShortsUrlRegex.test(query)) {
      const isPending = await redis.get(key);
      if (isPending) {
        log.warn(
          "InstantDownload",
          `The video is already in pending: ${query}, key: ${key}`,
        );
        return;
      }
    }

    const [video]: [Video | undefined, any] = await Promise.all([
      (async () => {
        if (facebookUrlRegex.test(query)) {
          log.info("InstantDownloader", `Found ${query}`);
          return await FacebookInstantDownloader(query);
        } else if (youtubeShortsUrlRegex.test(query)) {
          log.info("InstantDownloader", `Found ${query}`);
          return await YoutubeShortsInstantDownloader(query);
        }
      })(),
      redis.set(key, "1"),
    ]);

    if (!video) {
      log.warn("InstantDownload", `Downloader return undefined: ${query}`);
      await redis.del(key);
      return;
    }

    Promise.all([
      msg.reply(video.video, undefined, {
        caption: video.title ? video.title : "Instant Download",
      }),
      redis.del(key),
    ]);
  } catch (error) {
    log.error("InstantDownload", "Failed to download the video:", error);
  }
}

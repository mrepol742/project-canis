import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../../types/message";
import { FacebookInstantDownloader } from "./facebook";
import { YoutubeShortsInstantDownloader } from "./youtube";
import log from "../log";
import crypto from "crypto";
import redis from "../../redis";
import he from "he";
import * as Sentry from "@sentry/node";

export interface Video {
  video: MessageMedia;
  title: string | undefined;
}

function md5FromUrl(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex");
}

const facebookUrlRegex =
  /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+$/i;
const youtubeShortsUrlRegex =
  /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(\?[^\s#]*)?(#[^\s]*)?$/i;

export async function InstantDownloader(msg: Message): Promise<void> {
  const extractUrls = msg.body.match(/(https?:\/\/[^\s]+)/g);
  if (!extractUrls || extractUrls.length == 0) return;

  const query = extractUrls[0];
  if (!facebookUrlRegex.test(query) && !youtubeShortsUrlRegex.test(query))
    return;

  const key = `instantdownload:${md5FromUrl(query)}`;

  try {
    const isPending = await redis.get(key);
    if (isPending) {
      log.warn(
        "InstantDownload",
        `The video is already in pending: ${query}, key: ${key}`,
      );
      return;
    }

    msg.react("🔍");

    const [video]: [Video | undefined, any] = await Promise.all([
      (async () => {
        if (facebookUrlRegex.test(query)) {
          log.info("InstantDownloader", `Found ${query}`);
          msg.react("⬇️");
          return await FacebookInstantDownloader(query);
        } else if (youtubeShortsUrlRegex.test(query)) {
          log.info("InstantDownloader", `Found ${query}`);
          msg.react("⬇️");
          return await YoutubeShortsInstantDownloader(query);
        }
      })(),
      redis.set(key, "1", {
        expiration: {
          type: "EX",
          value: 3600, // 1 hour
        },
      }),
    ]);

    if (!video) {
      log.warn("InstantDownload", `Downloader return undefined: ${query}`);
      await redis.del(key);
      return;
    }

    await Promise.allSettled([
      msg.reply(video.video, undefined, {
        caption: video.title ? he.decode(video.title) : "Instant Download",
      }),
      redis.del(key),
    ]);
  } catch (err) {
    await redis.del(key);
    Sentry.captureException(err);
    log.error("InstantDownload", "Failed to download the video:", err);
  }
}

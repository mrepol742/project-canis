import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../../../types/message";
import { FacebookInstantDownloader } from "./facebook";
import { YoutubeShortsInstantDownloader } from "./youtube";
import log from "../log";

export interface Video {
  video: MessageMedia;
  title: string | undefined;
}

const facebookUrlRegex =
  /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s?#]+(\?[^\s#]*)?(#[^\s]*)?$/i;
const youtubeShortsUrlRegex =
  /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(\?[^\s#]*)?(#[^\s]*)?$/i;

export async function InstantDownloader(msg: Message) {
  const query = msg.body;
  let video: Video | undefined;

  if (facebookUrlRegex.test(query)) {
    log.info("InstantDownloader", `Found ${query}`);
    video = await FacebookInstantDownloader(query);
  } else if (youtubeShortsUrlRegex.test(query)) {
    log.info("InstantDownloader", `Found ${query}`);
    video = await YoutubeShortsInstantDownloader(query);
  }

  if (!video) return;

  await msg.reply(video.video, undefined, {
    caption: video.title ? video.title : "Instant Download",
  });
}

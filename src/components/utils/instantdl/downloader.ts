import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../../../types/message";
import { FacebookInstantDownloader } from "./facebook";
import { YoutubeShortsInstantDownloader } from "./youtube";

export interface Video {
  video: MessageMedia;
  title: string | undefined;
}

const facebookUrlRegex =
  /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+$/i;
const youtubeShortsUrlRegex =
  /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[A-Za-z0-9_-]{11}$/i;
const tiktokUrlRegex =
  /^(https?:\/\/)?(www\.)?(tiktok\.com\/(@[A-Za-z0-9._-]+\/video\/\d+|t\/[A-Za-z0-9]+)|vm\.tiktok\.com\/[A-Za-z0-9]+)\/?$/i;

export async function InstantDownloader(msg: Message) {
  const query = msg.body;
  let video: Video | undefined;

  if (facebookUrlRegex.test(query)) {
    video = await FacebookInstantDownloader(query);
  } else if (youtubeShortsUrlRegex.test(query)) {
    video = await YoutubeShortsInstantDownloader(query);
  } else if (tiktokUrlRegex.test(query)) {
  }

  if (!video) return;

  await msg.reply(video.video, undefined, {
    caption: video.title ? video.title : "Instant Download",
  });
}

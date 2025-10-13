import { Message, MessageMedia } from "whatsapp-web.js";
import { addMessage, getMessage } from "../services/message";
import log from "../utils/log";
import { getSetting } from "../services/settings";
import path from "path";

export default async function (msg: Message, revoked_msg?: Message) {
  try {
    if (msg.fromMe || !revoked_msg || revoked_msg.fromMe) return;

    const lid = (msg.author ?? msg.from).split("@")[0];

    const isMustResent = await getSetting("resent_unsent");
    if (!isMustResent || isMustResent === "off") return;

    const [chat, contact, mediaMessage] = await Promise.all([
      revoked_msg ? revoked_msg.getChat() : msg.getChat(),
      revoked_msg ? revoked_msg.getContact() : msg.getContact(),
      getMessage(revoked_msg ? revoked_msg.id.id : msg.id.id),
    ]);

    if (!mediaMessage && !revoked_msg.body) return;

    const title = chat.isGroup
      ? contact
        ? `@${contact.id._serialized.split("@")[0]} deleted this:`
        : "Someone deleted this:"
      : "You deleted this:";

    const caption = `${title}${revoked_msg.body ? `\n\n${revoked_msg.body}` : ""}`;

    const mediaFile = JSON.parse(mediaMessage?.content || "[]");
    const downloadFilePath = mediaMessage
      ? path.join("./.downloads", mediaFile.download_filename)
      : "";
    const media = mediaMessage
      ? MessageMedia.fromFilePath(downloadFilePath)
      : null;

    log.info("RevokeMessage", lid, revoked_msg.body);
    await Promise.all([
      addMessage(lid, revoked_msg.body, "revoke"),
      msg.reply(media || caption, undefined, {
        caption: media ? caption : undefined,
        mentions:
          chat.isGroup && contact
            ? [...revoked_msg.mentionedIds, contact.id._serialized]
            : revoked_msg.mentionedIds,
        sendAudioAsVoice: msg.type === "ptt",
        sendMediaAsDocument: msg.type === "document",
        sendMediaAsSticker: msg.type === "sticker",
        sendVideoAsGif: msg.isGif,
      }),
    ]);
  } catch (error) {
    log.error("RevokeMessage", "Failed to process revoked message", error);
  }
}

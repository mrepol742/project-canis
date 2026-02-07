import { Message } from "whatsapp-web.js";
import { addMessage } from "../services/message";
import log from "../utils/log";
import { getSetting } from "../services/settings";
import * as Sentry from "@sentry/node";
import { getBlockUser } from "../services/user";

export default async function (
  msg: Message,
  _newBody: string,
  prevBody: string,
) {
  try {
    if (msg.fromMe || !prevBody) return;

    const lid = (msg.author ?? msg.from).split("@")[0];

    const isPaused = await getSetting("paused");
    if (isPaused && isPaused === "on") return;

    const [isBlocked, isMustResent] = await Promise.all([
      getBlockUser(lid),
      getSetting("resent_edit"),
    ]);

    log.info("EditMessage", lid);
    await addMessage(lid, prevBody, "edit");

    if (!isBlocked || !isMustResent || isMustResent == "off") return;

    const [chat, contact, media] = await Promise.all([
      msg.getChat(),
      msg.getContact(),
      msg.hasMedia && msg.downloadMedia(),
    ]);

    const caption = `${
      chat.isGroup
        ? contact
          ? `@${contact.id._serialized.split("@")[0]} edited this:`
          : "Someone edited this:"
        : "You edited this:"
    }

    ${prevBody ?? ""}
  `;

    await msg.reply(media || caption, undefined, {
      caption: media ? caption : undefined,
      mentions:
        chat.isGroup && contact
          ? [...msg.mentionedIds, contact.id._serialized]
          : msg.mentionedIds,
    });
  } catch (err) {
    Sentry.captureException(err);
    log.error("EditMessage", "Failed to process edit message", err);
  }
}

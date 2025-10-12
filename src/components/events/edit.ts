import { Message } from "whatsapp-web.js";
import { getUserbyLid } from "../services/user";
import { addMessage } from "../services/message";
import log from "../utils/log";
import { getSetting } from "../services/settings";

/*
 * TODO: Implement settings to enable/disable this event.
 *       Currently, this event is always disabled.
 */
export default async function (
  msg: Message,
  _newBody: string,
  prevBody: string,
) {
  try {
    if (msg.fromMe) return;

    const lid = (msg.author ?? msg.from).split("@")[0];
    log.info("EditMessage", lid, prevBody);
    await addMessage(lid, prevBody, "edit");

    const isMustResent = await getSetting("resent_edit");
    if (!isMustResent || isMustResent == "off") return;

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
  } catch (error) {
    log.error("EditMessage", "Failed to process edit message", error);
  }
}

import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";
import { client } from "../../client";
import { getMessage } from "../../../data/group";

export default async function (notif: GroupNotification) {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;
    const group = await notif.getChat();
    const recipients = await notif.getRecipients();

    const leavers: string[] = [];
    const mentionIds: string[] = [];

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      const isSelf =
        contact.id._serialized === (await client()).info.wid._serialized;
      if (!isSelf) {
        log.info("GroupLeave", `${name} left the group ${group.name}`);
        leavers.push(contact.id._serialized.split("@")[0]);
        mentionIds.push(contact.id._serialized);
      } else {
        log.info("GroupLeave", `the bot left the group ${group.name}`);
        break;
      }
    }

    if (leavers.length == 0) return;
    const message = getMessage(
      "leaving",
      leavers.map((n) => `@${n}`).join(", "),
    );

    // await notif.reply(getMessage("leaving", `*${leavers.join(", ")}*`));
    (await client()).sendMessage(notif.chatId, message, {
      mentions: mentionIds,
    });
  } catch (err) {
    log.error("GroupLeave", "Failed to process group leave event:", err);
  }
}

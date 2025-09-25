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

    const leavers = [];

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      const isSelf = contact.id._serialized === client.info.wid._serialized;
      if (!isSelf) {
        log.info("GroupLeave", `${name} left the group ${group.name}`);
        leavers.push(name);
      } else {
        log.info("GroupLeave", `the bot left the group ${group.name}`);
      }
    }

    if (leavers.length > 0)
      await notif.reply(getMessage("leaving", `*${leavers.join(", ")}*`));
  } catch (err) {
    log.error("GroupLeave", "Failed to process group leave event:", err);
  }
}

import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";

export default async function (notif: GroupNotification) {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;
    const group = await notif.getChat();
    const recipients = await notif.getRecipients();

    const leavers = [];

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      log.info("Group Leave", `${name} left the group ${group.name}`);

      await sleep(1500); // prevent flooding
      leavers.push(name);
    }

    if (leavers.length > 0) {
      await notif.reply(
        leavers.length === 1
          ? `👋 *${leavers[0]}* has left. I’ll miss you!`
          : `👋 *${leavers.join(", ")}* have left. We’ll miss you all!`,
      );
    }
  } catch (err) {
    log.error("Group Leave", "Failed to process group leave event:", err);
  }
}

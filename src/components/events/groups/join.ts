import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";

export default async function join(notif: GroupNotification) {
  try {
    const group = await notif.getChat();
    const recipients = await notif.getRecipients();

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      log.info("Group Leave", `${name} left the group ${group.name}`);
      await sleep(1500); // prevent flooding
      await notif.reply(`👋 *${name}* has left. I’ll miss you!`);
    }
  } catch (err) {
    log.error("Group Leave", "Failed to process group leave event:", err);
  }
}

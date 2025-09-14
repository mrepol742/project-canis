import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";

export default async function (notif: GroupNotification) {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;
    const group = await notif.getChat();
    const recipients = await notif.getRecipients();

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      log.info("Group Join", `${name} joined the group ${group.name}`);
      await sleep(2000); // prevent flooding
      await notif.reply(`👋 Welcome *${name}* 🎉`);
    }
  } catch (err) {
    log.error("Group Join", "Failed to process group join event:", err);
  }
}

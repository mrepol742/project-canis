import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";
import { client } from "../../client";

const PROJECT_CANIS_ALIAS = process.env.PROJECT_CANIS_ALIAS || "Canis";

export default async function (notif: GroupNotification) {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;
    const group = await notif.getChat();
    const recipients = await notif.getRecipients();

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      const isSelf = contact.id._serialized === client.info.wid._serialized;

      await sleep(2000);

      log.info("Group Join", `${name} joined the group ${group.name}`);
      if (isSelf) {
        await notif.reply(
          `🙋‍♂️ Hello everyone! I'm ${PROJECT_CANIS_ALIAS} your WhatsApp Bot,
          for more information please send \`help\` or \`legal\.`,
        );
      } else {
        await notif.reply(`👋 Welcome *${name}* 🎉`);
      }
    }
  } catch (err) {
    log.error("Group Join", "Failed to process group join event:", err);
  }
}

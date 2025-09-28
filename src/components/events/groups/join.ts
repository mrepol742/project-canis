import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";
import { client } from "../../client";
import { getMessage } from "../../../data/group";

const PROJECT_CANIS_ALIAS = process.env.PROJECT_CANIS_ALIAS || "Canis";

export default async function (notif: GroupNotification) {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;
    const group = await notif.getChat();
    const recipients = await notif.getRecipients();
    const text = `
      🙋‍♂️ Hello everyone!

      I'm ${PROJECT_CANIS_ALIAS}, a scalable, modular and
      flexible chatbot for WhatsApp and Telegram.

      By continuing you agree to the bot \`terms\` and \`privacy\`.
      To list down commands type \`help\`.
    `;

    const newMembers = [];

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      const isSelf = contact.id._serialized === client.info.wid._serialized;

      log.info("GroupJoin", `${name} joined the group ${group.name}`);

      if (isSelf) {
        await notif.reply(text);
      } else {
        newMembers.push(name);
      }
    }

    if (newMembers.length > 0) {
      await notif.reply(getMessage("welcome", `*${newMembers.join(", ")}*`));
    }

    // mute the chat forever
    const chat = await notif.getChat();
    await chat.mute();
  } catch (err) {
    log.error("GroupJoin", "Failed to process group join event:", err);
  }
}

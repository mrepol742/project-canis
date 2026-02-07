import { GroupNotification } from "whatsapp-web.js";
import log from "../../utils/log";
import sleep from "../../utils/sleep";
import { client } from "../../client";
import { getMessage } from "../../../data/group";
import * as Sentry from "@sentry/node";
import { PROJECT_CANIS_ALIAS } from "../../../config";
import { getSetting } from "../../services/settings";

export default async function (notif: GroupNotification): Promise<void> {
  try {
    if (notif.timestamp < Date.now() / 1000 - 10) return;

    const isPaused = await getSetting("paused");
    if (isPaused && isPaused === "on") return;

    const group = await notif.getChat();
    const recipients = await notif.getRecipients();
    const text = `
      🙋‍♂️ Hello everyone!

      I'm ${PROJECT_CANIS_ALIAS}, a scalable, modular and
      flexible chatbot for WhatsApp and Telegram.

      By continuing you agree to the bot \`terms\` and \`privacy\`.
      To list down commands type \`help\`.
    `;

    const newMembers: string[] = [];
    const mentionIds: string[] = [];

    for (const contact of recipients) {
      const name = contact.pushname || contact.name || contact.id.user;
      const isSelf =
        contact.id._serialized === (await client()).info.wid._serialized;

      if (isSelf) {
        await notif.reply(text);
      } else {
        newMembers.push(contact.id._serialized.split("@")[0]);
        mentionIds.push(contact.id._serialized);
      }
    }

    log.info("GroupJoin", group.id.user, JSON.stringify(newMembers));

    await Promise.allSettled([
      (async () => {
        if (newMembers.length == 0) return;
        const message = getMessage(
          "welcome",
          newMembers.map((n) => `@${n}`).join(", "),
        );

        (await client()).sendMessage(notif.chatId, message, {
          mentions: mentionIds,
        });
        // await notif.sendMessage(message, { mentions: mentionIds });
      })(),
      (async () => {
        const chat = await notif.getChat();
        await chat.mute();
      })(),
    ]);
  } catch (err) {
    Sentry.captureException(err);
    log.error("GroupJoin", "Failed to process group join event:", err);
  }
}

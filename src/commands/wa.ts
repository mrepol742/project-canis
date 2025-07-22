import { Message } from "whatsapp-web.js";
import { client } from "../components/client";
import log from "../components/utils/log";
import logService from "../components/services/log";

export const info = {
  command: "wa",
  description: "Set WhatsApp status or name.",
  usage: "wa [status | name]",
  example: "wa status",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^wa\b\s*/i, "").trim();
  if (query.length !== 0) {
    if (!/^(status|name)$/i.test(query)) {
      await msg.reply(
        "Invalid argument. Please use one of the following:\n\nstatus or name"
      );
      return;
    }
  }

  if (msg.hasQuotedMsg) {
    await msg.reply("Please reply to a message to set the status or name.");
    return;
  }

  const quotedMsg = await msg.getQuotedMessage();
  if (!quotedMsg.body) {
    await msg.reply("Please reply to a message with the new status or name.");
    return;
  }
  if (query === "status") {
    client.setStatus(quotedMsg.body);
    await Promise.all([
      msg.reply("Status updated successfully."),
      logService(msg, "status", quotedMsg.body),
      log.info("wa", `Status updated to: ${quotedMsg.body}`),
    ]);
    return;
  }
  client.setDisplayName(quotedMsg.body);
  await Promise.all([
    msg.reply("Name updated successfully."),
    logService(msg, "name", quotedMsg.body),
    log.info("wa", `Name updated to: ${quotedMsg.body}`),
  ]);
}

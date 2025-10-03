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
  if (msg.fromMe) return;
  const lid = (msg.author ?? msg.from).split("@")[0];

  // log
  log.info("EditMessage", lid, prevBody);
  await addMessage(msg, prevBody, "edit");

  const isMustResent = await getSetting("resent_edit");
  if (!isMustResent || isMustResent == "off") return;

  const user = (await getUserbyLid(msg.from)) || "User";
  await msg.reply(
    `${msg.author ? user : "Your"} message was edited from "${prevBody}".`,
  );
}

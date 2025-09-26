import { Message } from "whatsapp-web.js";
import { getUserbyLid } from "../services/user";
import { addMessage } from "../services/message";
import log from "../utils/log";

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
  // const isGroup = !!msg.author;
  // const user = await getUserbyLid(msg.from) || "Your";
  //
  log.info("EditMessage", lid, prevBody);
  await addMessage(msg, prevBody, "edit");
  // await msg.reply(
  //   `${isGroup ? user : "Your"} message was edited from "${prevBody}".`
  // );
}

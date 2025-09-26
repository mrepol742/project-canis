import { Message } from "whatsapp-web.js";
import { getUserbyLid } from "../services/user";
import { addMessage } from "../services/message";
import log from "../utils/log";

/*
 * TODO: Implement settings to enable/disable this event.
 *       Currently, this event is always disabled.
 */
export default async function (msg: Message, revoked_msg?: Message) {
  if (msg.fromMe || !revoked_msg) return;
  const lid = (msg.author ?? msg.from).split("@")[0];
  // const isGroup = !!msg.author;
  // const user = (await getUserbyLid(msg.from)) || "Your";
  log.info("RevokeMessage", lid, revoked_msg?.body);
  await addMessage(msg, revoked_msg?.body, "revoke");
  // await msg.reply(
  //   `${isGroup ? user : "Your"} message "${revoked_msg?.body}" was deleted.`
  // );
}

import { Message } from "whatsapp-web.js";
import { getUserbyLid } from "../services/user";
import { addMessage } from "../services/message";

/*
 * TODO: Implement settings to enable/disable this event.
 *       Currently, this event is always disabled.
 */
export default async function (
  msg: Message,
  _newBody: string,
  prevBody: string,
) {
  if (msg.fromMe || msg.timestamp < Date.now() / 1000 - 10) return;

  // const isGroup = !!msg.author;
  // const user = await getUserbyLid(msg.from) || "Your";
  if (prevBody) await addMessage(msg, prevBody, "edit");
  // await msg.reply(
  //   `${isGroup ? user : "Your"} message was edited from "${prevBody}".`
  // );
}

import { Message } from "whatsapp-web.js";
import { getUserbyLid } from "../services/user";
import { addMessage } from "../services/message";

export default async function (msg: Message, revoked_msg?: Message) {
  if (msg.fromMe || !revoked_msg) return;
  const isGroup = !!msg.author;
  const user = (await getUserbyLid(msg.from)) || "Your";
  await addMessage(msg, revoked_msg?.body, "revoke");
  await msg.reply(
    `${isGroup ? user : "Your"} message "${revoked_msg?.body}" was deleted.`
  );
}

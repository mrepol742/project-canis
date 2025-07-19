import { Client, Reaction } from "whatsapp-web.js";
import log from "../utils/log";
import sleep from "../utils/sleep";
import { isBlocked } from "../services/user";

export default async function react(client: Client, react: Reaction) {
  if (react.msgId.fromMe || react.id.fromMe) return;
  if (!react.reaction?.trim()) return;

  const senderId = react.msgId.remote.split("@")[0];

  const isBlockedUser = await isBlocked(senderId);
  if (isBlockedUser) {
    return;
  }

  try {
    const message = await client.getMessageById(react.msgId._serialized);
    if (!message) return;
    await sleep(2000);
    await message.react(react.reaction);
    log.info("Reaction", `Reacted to message with ${react.reaction}`);
  } catch (error) {
    log.error("Failed to react back to message:", error);
  }
}

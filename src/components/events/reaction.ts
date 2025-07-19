import { Client, Reaction } from "whatsapp-web.js";
import log from "../utils/log";
import sleep from "../utils/sleep";

export default async function react(client: Client, react: Reaction) {
  if (react.msgId.fromMe) return;
  if (!react.reaction?.trim()) return;

  try {
    const message = await client.getMessageById(react.msgId._serialized);
    if (!message) return;
    await sleep(2000);
    await message.react(react.reaction);
  } catch (error) {
    log.error("Failed to react back to message:", error);
  }
}
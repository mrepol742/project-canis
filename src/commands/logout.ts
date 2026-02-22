import { Message } from "../types/message";
import { removeAccount } from "../components/client";
import log from "../components/utils/log";
import { deleteAccount } from "../components/services/account";
import redis from "../components/redis";

export const info = {
  command: "logout",
  description: "Log out the client from WhatsApp.",
  usage: "logout [clientId]",
  example: "logout",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  try {
    const query = msg.body.replace(/^logout\b\s*/i, "").trim();
    if (query.length > 0) {
      const isRootAccount = await redis.get('root_client_id');
      const rootClient = isRootAccount ? JSON.parse(isRootAccount) : null;
      if (rootClient.clientId === query) {
        removeAccount(query);
        deleteAccount(query);
        log.info("Logout", "Root client logged out successfully.");
        return;
      }
    }
    removeAccount(msg.clientId);
    deleteAccount(msg.clientId);
    log.info("Logout", "Client logged out successfully.");
  } catch (error) {
    log.error("Logout", "Failed to log out the client.", error);
    await msg.reply("An error occurred while trying to log out.");
  }
}

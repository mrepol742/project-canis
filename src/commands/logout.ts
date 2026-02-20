import { Message } from "../types/message";
import { removeAccount } from "../components/client";
import log from "../components/utils/log";
import { deleteAccount } from "../components/services/account";

export const info = {
  command: "logout",
  description: "Log out the client from WhatsApp.",
  usage: "logout",
  example: "logout",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  try {
    removeAccount(msg.clientId);
    deleteAccount(msg.clientId);
    log.info("Logout", "Client logged out successfully.");
  } catch (error) {
    log.error("Logout", "Failed to log out the client.", error);
    await msg.reply("An error occurred while trying to log out.");
  }
}

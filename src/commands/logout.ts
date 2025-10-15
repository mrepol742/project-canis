import { Message } from "../types/message"
import { client } from "../components/client";
import log from "../components/utils/log";

export const info = {
  command: "logout",
  description: "Log out the client from WhatsApp.",
  usage: "logout",
  example: "logout",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  if (!/^logout$/i.test(msg.body)) return;

  try {
    (await client()).logout();
    log.info("Logout", "Client logged out successfully.");
  } catch (error) {
    log.error("Logout", "Failed to log out the client.", error);
    await msg.reply("An error occurred while trying to log out.");
  }
}

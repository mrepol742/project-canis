import { Message } from "whatsapp-web.js";
import log from "npmlog";
import { commands } from "../index";

export const command = "cmd";
export const role = "user";

export default async function (msg: Message) {
  try {
    const userCommands = Object.values(commands)
      .filter((cmd: any) => cmd.role === "user")
      .map((cmd: any) => cmd.command)
      .join(", ");

    const adminCommands = Object.values(commands)
      .filter((cmd: any) => cmd.role === "admin")
      .map((cmd: any) => cmd.command)
      .join(", ");

    let response = "*User:*\n" + userCommands;
    if (adminCommands) {
      response += "\n\n*Admin:*\n" + adminCommands;
    }

    await msg.reply(response);
  } catch (error) {
    log.error("Command", "Error displaying commands:", error);
    await msg.reply("Failed to display commands.");
  }
}

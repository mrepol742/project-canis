import { Message } from "../types/message"
import log from "../components/utils/log";
import dotenv from "dotenv";

export const info = {
  command: "env",
  description:
    "Get all new process.env and append them into the project without restarting.",
  usage: "env",
  example: "env",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  dotenv.config({ override: true });
  await msg.reply("Dotenv override successfully.");
}

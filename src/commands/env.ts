import { Message } from "../../types/message";
import log from "../components/utils/log";
import dotenv from "dotenv";

export const info = {
  command: "env",
  description:
    "Get all new process.env and append them into the project without restarting.",
  usage: "env",
  example: "env",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^env/i.test(msg.body)) return;

  dotenv.config({ override: true });

  await msg.reply("Dotenv override successfully.");
}

import { Message } from "../types/message";
import { addAccount } from "../components/client";
import crypto from "crypto";

export const info = {
  command: "connect",
  description: "Connect your account to the bot.",
  usage: "connect",
  example: "connect",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  addAccount(crypto.randomBytes(16).toString('hex'), msg)
}

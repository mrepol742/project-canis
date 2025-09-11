import { Message } from "../../types/message"
import axios from "axios";
import log from "../components/utils/log";
import fs from "fs/promises";
import { client } from "../components/client";

export const info = {
  command: "google",
  description: "Search Google and return the first result.",
  usage: "google <query>",
  example: "google weather today",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^google\b\s*/i, "").trim();
  if (query.length === 0) return

  await msg.reply(`https://letmegooglethat.com/?q=${encodeURIComponent(query)}`);
}

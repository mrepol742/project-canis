import { Message, MessageMedia } from "whatsapp-web.js";
import axios from "axios";
import log from "../components/utils/log";
import { prisma } from "../components/prisma";

export const info = {
  command: "sql",
  description: "Execute a SQL query and return the result.",
  usage: "sql <query>",
  example: "sql SELECT * FROM users WHERE active = true;",
  role: "admin",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^sql\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a sql.");
    return;
  }

  try {
    const result = await prisma.$queryRawUnsafe(query);
    await msg.reply(JSON.stringify(result, null, 2));
  } catch (error: any) {
    log.error("sql", `Error querying data: ${error.message}`);
    await msg.reply(
      `Error querying data for "${query}". Please try again later.`
    );
  }
}

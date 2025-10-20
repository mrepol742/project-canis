import { Message } from "../types/message";
import axios from "../components/axios";
import log from "../components/utils/log";
import prisma from "../components/prisma";

export const info = {
  command: "sql",
  description: "Execute a SQL query and return the result.",
  usage: "sql <query>",
  example: "sql SELECT * FROM users WHERE active = true;",
  role: "super-admin",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^sql\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a sql query.");
    return;
  }

  try {
    const result = await prisma.$queryRawUnsafe(query);

    const output = JSON.stringify(result, null, 2);
    if (output.length > 4000) {
      await msg.reply(output.slice(0, 4000) + "\n\n[Output truncated]");
    } else {
      await msg.reply(output);
    }
  } catch (err: any) {
    const message = err?.message || "Unknown SQL error.";
    await msg.reply(message);
    log.error("sql", `Error running query: ${query}`, err);
  }
}

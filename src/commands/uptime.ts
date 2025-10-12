import { Message } from "../../types/message";
import os from "os";
import timestamp from "../components/utils/timestamp";
import { client } from "../components/client";

export const info = {
  command: "uptime",
  description: "Get the bot's uptime and process information.",
  usage: "uptime",
  example: "uptime",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^uptime$/.test(msg.body)) return;

  const waClient = await client();
  const [state, version] = await Promise.all([
    waClient.getState(),
    waClient.getWWebVersion(),
  ]);

  const statsMessage = `
    \`${timestamp(process.uptime())}\`

    ID: #${process.pid}
    LA: ${os
      .loadavg()
      .map((n) => n.toFixed(2))
      .join(", ")}
    State: ${state}
    Version: ${version}
    Node.js: ${process.version}
  `;

  await msg.reply(statsMessage);
}

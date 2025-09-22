import { Message } from "../../types/message"
import log from "../components/utils/log";
import { getUsers } from "../components/services/user";

export const info = {
  command: "top",
  description: "Get the top users of the bot.",
  usage: "top",
  example: "top",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^top$/i.test(msg.body)) return;

  const user = await getUsers();
  if (!user || user.length === 0) {
    await msg.reply("No users found.");
    return;
  }

  const text = `
    \`Top Users by Activity:\`

    ${user
      .filter((u, index) => u.commandCount !== 0 && index < 20)
      .map((u, index) => {
        const displayName =
          u.name.length > 12 ? u.name.slice(0, 12) + "..." : u.name;
        return `${index + 1}. ${displayName}: ${u.commandCount + u.quizAnswered} Points`;
      })
      .join("\n    ")}
    `;

  await msg.reply(text);
}

import { Message } from "../../types/message";
import log from "../components/utils/log";
import {
  getUsersPoints,
  getUsersCommandCount,
  getUsersQuiz,
} from "../components/services/user";

export const info = {
  command: "top",
  description: "Get the top users of the bot.",
  usage: "top",
  example: "top",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^top$/.test(msg.body)) return;

  const [usersPoints, usersCommandCount, usersQuiz] = await Promise.all([
    getUsersPoints(),
    getUsersCommandCount(),
    getUsersQuiz(),
  ]);

  const text = `
    \`Points:\`

    ${usersPoints
      .map((u, index) => {
        const displayName =
          u.name.length > 16 ? u.name.slice(0, 16) + ".. " : u.name;
        return `${index + 1}. ${displayName}: ${u.points.toFixed(2)} Points`;
      })
      .join("\n    ")}

    \`Quiz:\`

    ${usersQuiz
      .sort((a, b) => b.score - a.score)
      .map((u, index) => {
        const displayName =
          u.name.length > 16 ? u.name.slice(0, 16) + ".. " : u.name;
        return `${index + 1}. ${displayName}: ${u.score.toFixed(2)} Score`;
      })
      .join("\n    ")}

    \`Reputation:\`

    ${usersCommandCount
      .map((u, index) => {
        const displayName =
          u.name.length > 16 ? u.name.slice(0, 16) + ".. " : u.name;
        return `${index + 1}. ${displayName}: ${u.commandCount.toFixed(2)} Rep`;
      })
      .join("\n    ")}
    `;

  await msg.reply(text);
}

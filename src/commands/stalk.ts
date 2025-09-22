import { Message } from "../../types/message";
import { getQuizCount } from "../components/services/quiz";
import { getUserbyLid, isBlocked } from "../components/services/user";

export const info = {
  command: "stalk",
  description: "Stalk a user (not allowed).",
  usage: "stalk",
  example: "stalk @user",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to stalk.");
    return;
  }

  const lid = msg.mentionedIds[0].split("@")[0];
  const [user, isBlockUser] = await Promise.all([
    getUserbyLid(lid),
    isBlocked(lid),
  ]);
  if (!user) return await msg.reply("User not found.");

  const text = `
    \`${user.name}\`
    ${user.about || "No about information available."}

    ID: ${user.lid}
    Number: ${user.number}
    Country Code: ${user.countryCode}
    Type: ${user.type}
    Mode: ${user.mode}
    Command Count: ${user.commandCount}
    Last Seen: ${new Date(user.updatedAt).toLocaleString()}
    Blocked: ${isBlockUser ? "Yes" : "No"}
  `;
  await msg.reply(text);
}

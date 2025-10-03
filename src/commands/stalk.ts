import { Message } from "../../types/message";
import { getUserbyLid, isBlocked } from "../components/services/user";
import redis from "../components/redis";
import { client } from "../components/client";
import { MessageMedia } from "whatsapp-web.js";

export const info = {
  command: "stalk",
  description: "Stalk a user (not allowed).",
  usage: "stalk @user",
  example: "stalk @user",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to stalk.");
    return;
  }

  const jid = msg.mentionedIds[0];
  const lid = jid.split("@")[0];

  const [user, isBlockPermanently, isBlockedTemporarily, avatarUrl] =
    await Promise.all([
      getUserbyLid(lid),
      isBlocked(lid),
      redis.get(`rate:${lid}`),
      (await client()).getProfilePicUrl(jid).catch(() => null),
    ]);

  if (!user) {
    await msg.reply("User not found.");
    return;
  }

  const text = `
    \`${user.name}\`
    ${user.about || "No about information available."}

    ID: ${user.lid}
    Number: ${user.number}
    Country Code: ${user.countryCode}
    Type: ${user.type}
    Mode: ${user.mode}
    Command Count: ${user.commandCount}
    Quiz Answered: ${user.quizAnswered}
    Quiz Answered Wrong: ${user.quizAnsweredWrong}
    Points: ${user.points}
    Last Seen: ${new Date(user.updatedAt).toLocaleString()}
    Blocked: ${
      isBlockPermanently
        ? "Permanently Blocked"
        : isBlockedTemporarily
          ? JSON.parse(isBlockedTemporarily).penaltyCount
          : "No"
    }
  `;

  if (avatarUrl) {
    const res = await fetch(avatarUrl);
    const buffer = Buffer.from(await res.arrayBuffer());
    const media = new MessageMedia(
      "image/jpeg",
      buffer.toString("base64"),
      "avatar.jpg",
    );

    return await msg.reply(media, undefined, { caption: text });
  }

  await msg.reply(text);
}

import { Message } from "../types/message";
import { getUserbyLid, isAdmin } from "../components/services/user";
import redis from "../components/redis";
import parsePhoneNumber from "libphonenumber-js";
import { RateEntry } from "../components/utils/rateLimiter";
import { getCurrentTimeByCountryCode } from "../components/utils/time";
import downloadProfilePicture from "../components/utils/profile/download";
import { getClient } from "../components/client";

export const info = {
  command: "stalk",
  description: "Stalk a user (not allowed).",
  usage: "stalk @user",
  example: "stalk @user",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const chat = await msg.getChat();
  if (!chat.isGroup) {
    await msg.reply("This only works on group chats");
    return;
  }

  if (msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to stalk or use the `me` command.");
    return;
  }

  const jid = msg.mentionedIds[0];
  const lid = jid.split("@")[0];
  const isUserAdmin = await isAdmin(lid);

  if (!msg.fromMe && isUserAdmin) {
    await msg.reply("You cannot do that, please mention someone else.");
    return;
  }

  const [user, isBlockPermanently, isBlockedTemporarily, userProfilePicture] =
    await Promise.all([
      getUserbyLid(lid),
      redis.get(`block:${lid}`),
      redis.get(`rate:${lid}`),
      downloadProfilePicture(msg, jid),
    ]);

  if (!user) {
    await msg.reply(
      "Unable to find the user info, perhaps the user haven't use the bot before? I have no idea, i rest my case.",
    );
    return;
  }

  const self = getClient(msg.clientId).info.wid._serialized;

  if (self.split("@")[0] === user.number) {
    await msg.reply("You cannot do that, please mention someone else.");
    return;
  }

  const phoneNumber = parsePhoneNumber(`+${user.number}`);
  const countryCode = phoneNumber?.country ?? "";
  const time = getCurrentTimeByCountryCode(countryCode);
  const ratelimit: RateEntry = isBlockedTemporarily
    ? JSON.parse(isBlockedTemporarily)
    : { timestamps: [], penaltyCount: 0, penaltyUntil: 0 };

  const text = `
    \`${user.name}\`
    ${user.about ?? "No about information available."}

    ID: ${user.lid}
    Number: ${user.number}
    Country: ${countryCode} (${user.countryCode})
    Type: ${user.type == "private" ? "Personal" : "Business"}
    Command Count: ${user.commandCount}
    Quiz Answered: ${user.quizAnswered}
    Quiz Answered Wrong: ${user.quizAnsweredWrong}
    Points: ${user.points.toFixed(2)}
    Last Seen: ${user.updatedAt.toUTCString()}
    Current Time: ${time.localTime}
    Timezone: ${time.timezone.name}
    Is Admin: ${isUserAdmin ? "Yes" : "No"}
    Is Block: ${isBlockPermanently ? "Yes" : "No"}
    Is Bot: ${self.split("@")[0] == user.number ? "Yes" : "No"}
    Is Muted: ${isBlockedTemporarily && ratelimit.penaltyCount > 0 ? "Yes" : "No"}
    ${isBlockedTemporarily && ratelimit.penaltyCount > 0 ? `Penalty: ${ratelimit.penaltyCount} ${new Date(ratelimit.penaltyUntil).toUTCString()}` : ""}
  `;

  await msg.reply(userProfilePicture || text, undefined, {
    caption: userProfilePicture ? text : "",
  });
}

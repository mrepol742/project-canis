import { Message } from "../types/message";
import { getUserbyLid, isAdmin } from "../components/services/user";
import redis from "../components/redis";
import parsePhoneNumber from "libphonenumber-js";
import { RateEntry } from "../components/utils/rateLimiter";
import { getCurrentTimeByCountryCode } from "../components/utils/time";
import downloadProfilePicture from "../components/utils/profile/download";
import { getClient } from "../components/client";

export const info = {
  command: "me",
  description: "Shows user info.",
  usage: "me",
  example: "me",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const jid = msg.author ?? msg.from;
  const lid = jid.split("@")[0];

  const [
    user,
    isBlockPermanently,
    isBlockedTemporarily,
    isUserAdmin,
    userProfilePicture,
  ] = await Promise.all([
    getUserbyLid(lid),
    redis.get(`block:${lid}`),
    redis.get(`rate:${lid}`),
    isAdmin(lid),
    downloadProfilePicture(msg, jid),
  ]);

  if (!user) {
    await msg.reply(
      "You have not use the bot commands before, now you do! Try again.",
    );
    return;
  }

  const phoneNumber = parsePhoneNumber(`+${user.number}`);
  const countryCode = phoneNumber?.country ?? "";
  const time = getCurrentTimeByCountryCode(countryCode);
  const self = getClient(msg.clientId).info.wid._serialized;
  const ratelimit: RateEntry = isBlockedTemporarily
    ? JSON.parse(isBlockedTemporarily)
    : { timestamps: [], penaltyCount: 0, penaltyUntil: 0 };

  const text = `
    \`${user.name}\`
    ${user.about ?? "No more about you (its private)."}

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

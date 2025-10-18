import { Message } from "../types/message";
import { getUserbyLid } from "../components/services/user";
import redis from "../components/redis";
import { client } from "../components/client";
import { MessageMedia } from "whatsapp-web.js";
import parsePhoneNumber from "libphonenumber-js";
import moment from "moment-timezone";
import { getTimezonesForCountry, Timezone } from "countries-and-timezones";
import axios from "../components/axios";
import fs from "fs";
import path from "path";
import log from "../components/utils/log";
import { RateEntry } from "../components/utils/rateLimiter";

export const info = {
  command: "stalk",
  description: "Stalk a user (not allowed).",
  usage: "stalk @user",
  example: "stalk @user",
  role: "user",
  cooldown: 5000,
};

const fileExists = async (filePath: string) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

function getCurrentTimeByCountryCode(countryCode: string) {
  const timezones: Timezone[] | undefined = getTimezonesForCountry(
    countryCode.toUpperCase(),
  );

  if (!timezones || timezones.length === 0) {
    throw new Error("Invalid country code or no timezones found.");
  }

  const timezone = timezones[0];
  const localTime = moment().tz(timezone.name).format("YYYY-MM-DD HH:mm:ss");

  return { countryCode, timezone, localTime };
}

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

  const [user, isBlockPermanently, isBlockedTemporarily, userProfilePicture] =
    await Promise.all([
      getUserbyLid(lid),
      redis.get(`block:${lid}`),
      redis.get(`rate:${lid}`),
      (async () => {
        try {
          const tempDir = "./.temp";
          await fs.promises.mkdir(tempDir, { recursive: true });
          const savePath = path.join(tempDir, `profile_${lid}.png`);

          if (await fileExists(savePath)) {
            return MessageMedia.fromFilePath(savePath);
          }

          const avatarUrl = await (await client()).getProfilePicUrl(jid);

          if (!avatarUrl) return undefined;

          const res = await axios.get(avatarUrl, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(res.data, "binary");

          await fs.promises.writeFile(savePath, buffer);
          return new MessageMedia(
            "image/jpeg",
            buffer.toString("base64"),
            "avatar.jpg",
          );
        } catch (error) {
          log.error("Me", "Unable to fetch user profile pic:", error);
          return undefined;
        }
      })(),
    ]);

  if (!user) {
    await msg.reply(
      "Unable to find the user info, perhaps the user haven't use the bot before? I have no idea, i rest my case.",
    );
    return;
  }

  const phoneNumber = parsePhoneNumber(`+${user.number}`);
  const countryCode = phoneNumber?.country || "";
  const time = getCurrentTimeByCountryCode(countryCode);
  const self = (await client()).info.wid._serialized;
  const ratelimit: RateEntry = isBlockedTemporarily
    ? JSON.parse(isBlockedTemporarily)
    : { timestamps: [], penaltyCount: 0, penaltyUntil: 0 };

  const text = `
    \`${user.name}\`
    ${user.about || "No about information available."}

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
    Is Block: ${isBlockPermanently ? "Yes" : "No"}
    Is Bot: ${self.split("@")[0] == user.number ? "Yes" : "No"}
    Is Muted: ${isBlockedTemporarily && ratelimit.penaltyCount > 0 ? "Yes" : "No"}
    ${isBlockedTemporarily && ratelimit.penaltyCount > 0 ? `Penalty: ${ratelimit.penaltyCount} ${new Date(ratelimit.penaltyUntil).toUTCString()}` : ""}
  `;

  await msg.reply(userProfilePicture || text, undefined, {
    caption: userProfilePicture ? text : "",
  });
}

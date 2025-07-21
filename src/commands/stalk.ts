import { Message } from "whatsapp-web.js";
import { getUserbyLid } from "../components/services/user";

export const info = {
  command: "stalk",
  description: "Stalk a user (not allowed).",
  usage: "stalk",
  example: "stalk @user",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (msg.body.includes(" ") && msg.mentionedIds.length === 0) {
    await msg.reply("Please mention a user to stalk.");
    return;
  }

  if (msg.mentionedIds.length === 0) {
    const contact = await msg.getContact();
    const countryCode = await contact.getCountryCode();
    const about = await contact.getAbout();
    const name = contact.pushname || contact.name || "Unknown";

    const text = `
    \`${name}\`
    ${about || "No about information available."}

    ID: ${contact.id.user}
    Number: ${contact.number}
    Country Code: ${countryCode}
    Type: ${contact.isBusiness ? "Business" : "Personal"}
    Mode: ${msg.author ? "group" : "private"}
    `;
    await msg.reply(text);
    return;
  }

  const user = await getUserbyLid(msg.mentionedIds[0].split("@")[0]);
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
    `;
  await msg.reply(text);
}

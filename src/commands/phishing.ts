import { Message } from "../../types/message";
import { phishingSet } from "..";
import { normalize } from "../components/utils/url";
import log from "../components/utils/log";

export const info = {
  command: "phishing",
  description: "A simple phishtank test command.",
  usage: "phishing",
  example: "phishing",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  if (!/^phishing/i.test(msg.body)) return;

  if (!msg.hasQuotedMsg) {
    const testMessage = `
    \`Phishtank\`

    Found ${phishingSet.size} phishing pages.
    Hint: You can reply this command to messages.
  `;

    await msg.reply(testMessage);
    return;
  }

  const qouted = await msg.getQuotedMessage();
  const extractUrls = qouted.body.match(/(https?:\/\/[^\s]+)/g) || [];
  const urls = extractUrls
    .map((url) => normalize(url))
    .filter((u): u is string => Boolean(u));
  const spamUrls = urls.filter((url) => phishingSet.has(url));
  if (spamUrls.length == 0) {
    const testMessage = `
    \`Phishtank\`

    This message doesn't contain any links or so.
  `;

    await msg.reply(testMessage);
    return;
  }

  const text = `
    \`Phishing Alert\`

    We've found that this url(s): \`${spamUrls.join(", ")}\`
    to be phishing site/page.
    Proceed with caution.
  `;
  await msg.reply(text);
}

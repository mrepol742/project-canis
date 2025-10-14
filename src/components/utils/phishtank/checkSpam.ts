import { phishingSet } from "../../..";
import { Message } from "../../../../types/message";
import log from "../log";
import { normalize } from "../url";

const isPhishtankEnable = process.env.PHISHTANK_ENABLE === "true";

export default async function (msg: Message) {
  if (!isPhishtankEnable) return;
  try {
    const extractUrls = msg.body.match(/(https?:\/\/[^\s]+)/g) || [];
    if (!extractUrls || extractUrls.length === 0) return;

    const urls = extractUrls
      .map((url) => normalize(url))
      .filter((u): u is string => Boolean(u));
    const spamUrls = urls.filter((url) => phishingSet.has(url));
    if (spamUrls.length == 0) return;

    const text = `
    \`Phishing Alert\`

    We've found that this url(s): ${spamUrls.join(", ")}
    is reported Phishing. Proceed with caution.
    `;
    await msg.reply(text);
  } catch (error) {
    log.error(
      "PhishTank",
      "Unable to check message for potential spam links:",
      error,
    );
  }
}

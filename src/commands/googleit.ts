import { Message } from "../../types/message";
import puppeteer from "puppeteer";
import { MessageMedia } from "whatsapp-web.js";

export const info = {
  command: "googleit",
  description: "Search Google and return the first result.",
  usage: "googleit <query>",
  example: "googleit weather today",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^googleit\b\s*/i, "").trim();
  if (query.length === 0) return;

  const url = `https://letmegooglethat.com/?q=${query.replaceAll(" ", "+")}`;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  );

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.setViewport({ width: 1024, height: 768 });

  const buffer = await page.screenshot();
  await browser.close();

  const media = new MessageMedia(
    "image/png",
    buffer.toString("base64"),
    `result.png`,
  );
  await msg.reply(media, undefined, {
    caption: `https://google.com/search?q=${query.replaceAll(" ", "+")}`,
  });
}

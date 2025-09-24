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

  const url = `https://letmegooglethat.com/?q=${encodeURIComponent(query)}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 800, height: 600 });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const buffer = await page.screenshot({ fullPage: true });
  await browser.close();

  const media = new MessageMedia(
    "image/png",
    buffer.toString("base64"),
    `result.png`,
  );
  await msg.reply(media, undefined, { caption: url });
}

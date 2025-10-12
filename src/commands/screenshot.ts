import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import puppeteer from "puppeteer";
import fs from "fs/promises";

export const info = {
  command: "screenshot",
  description: "Take a screenshot of a webpage.",
  usage: "screenshot <url> [--full-page]",
  example: "screenshot https://example.com --full-page",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  let query = msg.body.replace(/^screenshot\b\s*/i, "").trim();

  // Check for --full-page flag
  const fullPage = /--full-page/i.test(query);
  query = query.replace(/--full-page/i, "").trim();

  if (query.length === 0) {
    await msg.reply("Please provide a URL to take a screenshot of.");
    return;
  }

  // Validate URL
  if (!/^https?:\/\//i.test(query)) {
    await msg.reply(
      "Please provide a valid URL starting with http:// or https://",
    );
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  );

  await page.goto(query, { waitUntil: "domcontentloaded" });
  await page.setViewport({ width: 1024, height: 768 });

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const buffer = await page.screenshot({ fullPage });
  await browser.close();

  const media = new MessageMedia(
    "image/png",
    buffer.toString("base64"),
    `screenshot.png`,
  );

  await msg.reply(media);
}

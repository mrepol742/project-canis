import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message";
import puppeteer from "puppeteer";
import fs from "fs/promises";

export const info = {
  command: "screenshot",
  description: "Take a screenshot of a webpage.",
  usage: "screenshot <url>",
  example: "screenshot https://example.com",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^screenshot\b\s*/i, "").trim();
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

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(query, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 800, height: 600 });

  const tempDir = "./.temp";
  await fs.mkdir(tempDir, { recursive: true });

  const buffer = await page.screenshot({ fullPage: true });
  await browser.close();

  const media = new MessageMedia(
    "image/png",
    buffer.toString("base64"),
    `result.png`,
  );
  await msg.reply(media);
}

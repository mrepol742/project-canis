import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../types/message";
import client from "../components/client";
import log from "../components/utils/log";
import * as Sentry from "@sentry/node";

export const info = {
  command: "screenshot",
  description: "Take a screenshot of a webpage.",
  usage: "screenshot <url> [--full-page]",
  example: "screenshot https://example.com --full-page",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
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

  const browser = (await client()).pupBrowser;
  if (!browser) {
    throw Error("Unable to access browser instance");
  }

  const page = await browser.newPage();

  try {
    await Promise.allSettled([
      page.setUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      ),
      page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });

        Object.defineProperty(navigator, "languages", {
          get: () => ["en-US", "en"],
        });
      }),
      page.setViewport({ width: 1366, height: 768 }),
    ]);
    await page.goto(query, { waitUntil: "domcontentloaded", timeout: 15000 });

    const buffer = await page.screenshot({ fullPage });

    const media = new MessageMedia(
      "image/png",
      buffer.toString("base64"),
      `screenshot.png`,
    );

    await msg.reply(media, undefined, {
      caption: "Here's your screenshot of the site you requested.",
    });
  } catch (err) {
    Sentry.captureException(err);
    await msg.reply("Failed to take screenshot, somebody took the camera!");
    log.error("Screenshot", "Failed to take screenshot:", err);
  } finally {
    await page.close();
  }
}

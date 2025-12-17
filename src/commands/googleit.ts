import { Message } from "../types/message";
import log from "../components/utils/log";
import * as Sentry from "@sentry/node";
import { MessageMedia } from "whatsapp-web.js";
import client from "../components/client";

export const info = {
  command: "googleit",
  description: "Search Google and return the first result.",
  usage: "googleit <query>",
  example: "googleit weather today",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message): Promise<void> {
  const query = msg.body.replace(/^googleit\b\s*/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a search query.");
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
    await page.goto(`https://google.com/search?=${query}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const buffer = await page.screenshot();

    const media = new MessageMedia(
      "image/png",
      buffer.toString(),
      `screenshot.png`,
    );

    await msg.reply(media, undefined, {
      caption: "Here, i google it for you.",
    });
  } catch (err) {
    Sentry.captureException(err);
    await msg.reply("Failed to take screenshot, somebody took the camera!");
    log.error("Screenshot", "Failed to take screenshot:", err);
  } finally {
    await page.close();
  }
}

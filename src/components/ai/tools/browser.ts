import puppeteer from "puppeteer-core";
import { PUPPETEER_EXEC_PATH } from "../../../config";
import type { AgentTool } from "./types";

const CONTENT_LIMIT = 4000;

export const browserTool: AgentTool = {
  name: "browser",
  description:
    "Control a Chrome browser to search the web or visit a URL. " +
    "Pass a plain search query to search Google (e.g. 'latest AI news'), " +
    "or pass a full URL to navigate directly (e.g. 'https://example.com'). " +
    "Returns search results or page text content.",
  parameters: {
    type: "object",
    properties: {
      input: {
        type: "string",
        description:
          "A search query (e.g. 'TypeScript best practices 2025') " +
          "or a full URL (e.g. 'https://developer.mozilla.org/en-US/docs/Web/API')",
      },
    },
    required: ["input"],
  },
};

const CHROME_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-sync",
  "--disable-translate",
  "--mute-audio",
  "--no-first-run",
  "--safebrowsing-disable-auto-update",
];

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: PUPPETEER_EXEC_PATH,
    headless: true,
    args: CHROME_ARGS,
  });
}

async function setupPage(browser: Awaited<ReturnType<typeof launchBrowser>>) {
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  // Block heavy resources — we only need text
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "media", "font"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });
  return page;
}

async function extractGoogleResults(
  page: Awaited<ReturnType<typeof setupPage>>,
): Promise<string> {
  // Wait for either the results container or the main content
  await page.waitForSelector("#rso, #search, main", { timeout: 10_000 }).catch(() => {});

  const results = await page.evaluate(() => {
    const items: Array<{ title: string; url: string; snippet: string }> = [];

    // Each organic result lives in a div.g or a sibling container inside #rso
    const blocks = document.querySelectorAll(
      "#rso div.g, #rso [data-sokoban-container], #rso > div > div",
    );

    for (const block of Array.from(blocks)) {
      const h3 = block.querySelector("h3");
      const link = block.querySelector<HTMLAnchorElement>("a[href^='http']");
      // Snippet: try known class names, fall back to any paragraph text
      const snippetEl =
        block.querySelector(".VwiC3b, [data-sncf='1'], .yXK7lf, .lEBKkf") ??
        block.querySelector("span, p");

      if (!h3 || !link) continue;

      const title = h3.textContent?.trim() ?? "";
      const url = link.href;
      const snippet = snippetEl?.textContent?.trim() ?? "";

      if (title && url) {
        items.push({ title, url, snippet });
      }
      if (items.length >= 6) break;
    }

    return items;
  });

  if (results.length > 0) {
    return results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.snippet}`)
      .join("\n\n");
  }

  // Fallback: return raw text from the results area
  const fallback = await page.evaluate(() => {
    return (
      (document.querySelector("#search") as HTMLElement)?.innerText?.slice(0, 4000) ??
      (document.body as HTMLElement)?.innerText?.slice(0, 4000) ??
      ""
    );
  });

  return fallback.trim() || "No results found.";
}

async function extractPageText(
  page: Awaited<ReturnType<typeof setupPage>>,
): Promise<string> {
  const text: string = await page.evaluate(() => {
    document
      .querySelectorAll("script, style, nav, footer, header, aside, [aria-hidden='true']")
      .forEach((el) => el.remove());
    return (document.body?.innerText ?? "").replace(/\s{3,}/g, "\n\n").trim();
  });

  if (!text) return "No readable text found on that page.";

  return text.length > CONTENT_LIMIT
    ? text.slice(0, CONTENT_LIMIT) + `\n\n[...truncated at ${CONTENT_LIMIT} chars]`
    : text;
}

export async function runBrowser(input: string): Promise<string> {
  const trimmed = input.trim();
  const isUrl = /^https?:\/\//i.test(trimmed);

  const targetUrl = isUrl
    ? trimmed
    : `https://www.google.com/search?q=${encodeURIComponent(trimmed)}&hl=en`;

  let browser: Awaited<ReturnType<typeof launchBrowser>> | null = null;

  try {
    browser = await launchBrowser();
    const page = await setupPage(browser);

    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 25_000,
    });

    const result = isUrl
      ? await extractPageText(page)
      : await extractGoogleResults(page);

    return result;
  } catch (err: any) {
    return `Browser error: ${err?.message ?? String(err)}`;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

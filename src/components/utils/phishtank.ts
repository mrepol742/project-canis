import * as path from "path";
import log from "./log";

const phishTankFile = path.join(
  __dirname,
  "../../../.phishtank/verified_online.json",
);
let phishingSet: Set<string> = new Set();

function normalizeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    let normalized = `${u.protocol}//${u.hostname}${u.pathname}`;
    if (!normalized.endsWith("/")) {
      normalized += "/";
    }
    return normalized;
  } catch {
    return null;
  }
}

async function loadPhishTank() {
  try {
    const data = await import(phishTankFile);

    const urls = data.default
      .map((entry: any) => normalizeUrl(entry.url))
      .filter((u: string | null): u is string => Boolean(u));

    phishingSet = new Set(urls);

    log.info(
      "Phishtank",
      `Loaded ${phishingSet.size} phishing URLs from PhishTank.`,
    );
  } catch (err: any) {
    log.error("Phishtank", "Error loading PhishTank JSON:", err.message || err);
  }
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

export function checkMessage(message: string): string[] {
  const urls = extractUrls(message)
    .map((url) => normalizeUrl(url))
    .filter((u): u is string => Boolean(u));

  return urls.filter((url) => phishingSet.has(url));
}

loadPhishTank();

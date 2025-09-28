import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import bz2 from "unbzip2-stream";
import log from "./utils/log";

interface PhishEntry {
  phish_id?: string;
  phish_detail_url?: string;
  url?: string;
  submission_time?: string;
  online?: string;
  target?: string;
  [k: string]: any;
}

export default class PhishTankClient {
  private dataDir = path.join(__dirname, "../../.phishtank");
  private rawFilePath = path.join(this.dataDir, "verified_online.json");
  private etagPath = path.join(this.dataDir, "verified_online.etag");
  private updateHourUTC = parseInt(process.env.PHISHTANK_UPDATE_HOUR ?? "3");
  private autoUpdateDaily = process.env.PHISHTANK_AUTO_UPDATE === "true";
  private isPhishtankEnable = process.env.PHISHTANK_ENABLE === "true";
  private dataUrl = "http://data.phishtank.com/data/online-valid.json.bz2";

  private phishingSet: Set<string> = new Set();
  private autoUpdateTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (this.autoUpdateDaily && this.isPhishtankEnable)
      this.startAutoUpdateLoop();
  }

  async init(): Promise<void> {
    if (!this.isPhishtankEnable) return;
    await fsp.mkdir(this.dataDir, { recursive: true });
    await this.loadLocalFile();
  }

  private async loadLocalFile(): Promise<void> {
    try {
      const raw = await fsp.readFile(this.rawFilePath, "utf8");
      const parsed = JSON.parse(raw);
      this.phishingSet = new Set(
        parsed.map((e: PhishEntry) => this.normalizeUrl(e.url)).filter(Boolean),
      );
      log.info(
        "PhishTankClient",
        `Loaded ${this.phishingSet.size} phish URLs from disk.`,
      );
    } catch (err: any) {
      log.warn(
        "PhishTankClient",
        "No local phishtank file found or failed to parse:",
        err.message || err,
      );
      this.updateNow();
    }
  }

  getPhishingSet(): Set<string> {
    return this.phishingSet;
  }

  private normalizeUrl(raw?: string | null): string | null {
    if (!raw) return null;
    try {
      const u = new URL(raw.trim());
      let normalized = `${u.protocol}//${u.hostname}${u.pathname}`;
      if (!normalized.endsWith("/")) normalized += "/";
      return normalized.toLowerCase();
    } catch {
      return null;
    }
  }

  private async fetchRemoteEtag(): Promise<string | null> {
    try {
      const res = await fetch(this.dataUrl);
      if (!res.ok) {
        log.warn(
          "PhishTankClient",
          `HEAD returned ${res.status} ${res.statusText}`,
        );
        return null;
      }
      const etag = res.headers.get("etag") || res.headers.get("ETag");
      return etag;
    } catch (err: any) {
      log.error(
        "PhishTankClient",
        "Failed to HEAD remote feed:",
        err.message || err,
      );
      return null;
    }
  }

  private async readStoredEtag(): Promise<string | null> {
    try {
      const s = await fsp.readFile(this.etagPath, "utf8");
      return s.trim();
    } catch {
      return null;
    }
  }

  private async writeStoredEtag(etag: string | null): Promise<void> {
    if (!etag) return;
    try {
      await fsp.writeFile(this.etagPath, etag, "utf8");
    } catch (err: any) {
      log.warn(
        "PhishTankClient",
        "Unable to write etag file:",
        err.message || err,
      );
    }
  }

  async updateNow(): Promise<boolean> {
    log.info("PhishTankClient", "Checking PhishTank for updates...");
    const remoteEtag = await this.fetchRemoteEtag();
    const localEtag = await this.readStoredEtag();

    if (remoteEtag && localEtag && remoteEtag === localEtag) {
      log.info(
        "PhishTankClient",
        "PhishTank dataset not changed (ETag match).",
      );
      return false;
    }

    try {
      const resp = await fetch(this.dataUrl);
      if (!resp.ok) {
        throw new Error(`Download failed: ${resp.status} ${resp.statusText}`);
      }

      const tempPath = this.rawFilePath + ".tmp";
      const destStream = fs.createWriteStream(tempPath, { encoding: "utf8" });

      if (!resp.body) throw new Error("No response body from PhishTank");

      await pipeline(resp.body as any, bz2(), destStream);

      const raw = await fsp.readFile(tempPath, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        log.warn(
          "PhishTankClient",
          "Downloaded phishtank JSON is not an array; continuing but be cautious.",
        );
      }

      await fsp.rename(tempPath, this.rawFilePath);
      this.phishingSet = new Set(
        parsed.map((e: PhishEntry) => this.normalizeUrl(e.url)).filter(Boolean),
      );
      log.info(
        "PhishTankClient",
        `Updated local phishtank file; ${this.phishingSet.size} URLs loaded.`,
      );
      if (remoteEtag) await this.writeStoredEtag(remoteEtag);
      return true;
    } catch (err: any) {
      log.error("PhishTankClient", "Update failed:", err.message || err);
      return false;
    }
  }

  startAutoUpdateLoop() {
    if (this.autoUpdateTimer) return;

    const scheduleNext = async () => {
      try {
        const now = new Date();
        const next = new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            this.updateHourUTC,
            0,
            0,
            0,
          ),
        );
        if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
        const ms = next.getTime() - now.getTime();
        log.info(
          "PhishTankClient",
          `Next PhishTank update scheduled at ${next.toISOString()}`,
        );
        this.autoUpdateTimer = setTimeout(async () => {
          try {
            await this.updateNow();
          } catch (err: any) {
            log.error(
              "PhishTankClient",
              "Scheduled update failed:",
              err.message || err,
            );
          } finally {
            // schedule again
            scheduleNext();
          }
        }, ms);
      } catch (err: any) {
        log.error(
          "PhishTankClient",
          "Failed to schedule next update:",
          err.message || err,
        );
        this.autoUpdateTimer = setTimeout(scheduleNext, 60 * 60 * 1000);
      }
    };

    this.init()
      .then(() => {
        this.fetchRemoteEtag()
          .then(async (remoteEtag) => {
            const localEtag = await this.readStoredEtag();
            if (!remoteEtag || !localEtag || remoteEtag !== localEtag) {
              await this.updateNow();
            } else {
              log.info(
                "PhishTankClient",
                "Local data already up-to-date at startup.",
              );
            }
            scheduleNext();
          })
          .catch((err) => {
            log.warn("PhishTankClient", "HEAD check failed at startup:", err);
            scheduleNext();
          });
      })
      .catch((err) => {
        log.error("PhishTankClient", "Init failed:", err);
        scheduleNext();
      });
  }

  stopAutoUpdateLoop() {
    if (this.autoUpdateTimer) {
      clearTimeout(this.autoUpdateTimer);
      this.autoUpdateTimer = null;
      log.info("PhishTankClient", "Auto-update loop stopped.");
    }
  }
}

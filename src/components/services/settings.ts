import log from "../../components/utils/log";
import redis from "../redis";
import * as Sentry from "@sentry/node";

export async function saveSetting(name: string, value: string): Promise<void> {
  try {
    await redis.set(`settings:${name}`, value);
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", `Failed to save setting: ${name}`, error);
  }
}

export async function getSetting(name: string): Promise<string> {
  try {
    const value = await redis.get(`settings:${name}`);
    return value ?? "off";
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", `Failed to get setting: ${name}`, error);
  }
  return "off";
}

export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const keys = await redis.keys("settings:*");
    if (!keys || keys.length === 0) return {};

    const values = (await redis.mGet(keys)) as (string | null)[];

    const settings: Record<string, string> = {};

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const name = key.slice("settings:".length);
      const value = values[i];

      settings[name] = typeof value === "string" ? value : "off";
    }

    return settings;
  } catch (error) {
    Sentry.captureException(error);
    log.error("Redis", "Failed to get all settings.", error);
  }
  return {};
}

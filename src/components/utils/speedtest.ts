import speedTest from "speedtest-net";
import redis from "../redis";
import { CACHE_KEY } from "../../jobs/speedtest";

export default async function (): Promise<speedTest.ResultEvent | null> {
  try {
    const cached = await redis.get(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch (error) {}
  return null;
}

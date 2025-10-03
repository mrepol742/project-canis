import speedTest from "speedtest-net";
import redis from "../redis";

const CACHE_KEY = "speedtest:result";
const CACHE_TTL = 60 * 60 * 12; // 12 hour

export default async function (): Promise<speedTest.ResultEvent> {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const results = await speedTest({ acceptLicense: true, acceptGdpr: true });
  await redis.set(CACHE_KEY, JSON.stringify(results), { EX: CACHE_TTL });
  return results;
}

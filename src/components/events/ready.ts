import { getClient } from "../client";
import redis from "../redis";

export default async function (): Promise<void> {
  const restart = await redis.get("restart");
  if (!restart) return;

  const r: { id: string; date: number; clientId: string } = JSON.parse(restart);

  const timeTook = Date.now() - r.date;

  const seconds = Math.floor(timeTook / 1000);
  const minutes = Math.floor(seconds / 60);
  const formatted =
    minutes > 0
      ? `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds % 60} second${seconds % 60 !== 1 ? "s" : ""}`
      : `${seconds} second${seconds !== 1 ? "s" : ""}`;

  await Promise.all([
    redis.del("restart"),
    getClient(r.clientId).sendMessage(
      r.id,
      `Restart finished. Took ${formatted}.`,
    ),
  ]);
}

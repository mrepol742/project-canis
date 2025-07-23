import { openrouter, generateText } from "./openRouter";
import { groq } from "./groq";
import redis from "../redis";

const aiProvider = process.env.AI_PROVIDER || "groq";
const isQueryCachingEnabled = process.env.ALLOW_QUERY_CACHING === "true";
const queryCachingCount = parseInt(
  process.env.QUERY_CACHING_COUNT || "1000",
  10
);
const queryCachingTTL = parseInt(process.env.QUERY_CACHING_TTL || "3600", 10);

function getCacheKey(prompt: string) {
  return `ai:prompt:${Buffer.from(prompt).toString("base64")}`;
}

export default async function (prompt: string, model?: string) {
  const cacheKey = getCacheKey(prompt);

  if (isQueryCachingEnabled) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return cached;
    }
  }

  let result: string | null;
  if (aiProvider === "openrouter") {
    const { text } = await generateText({
      model: openrouter(model || "moonshotai/kimi-k2:free"),
      prompt: prompt,
    });
    result = text;
  } else if (aiProvider === "groq") {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model || "meta-llama/llama-4-scout-17b-16e-instruct",
    });
    result = chatCompletion.choices[0].message.content;
  } else {
    throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }

  if (isQueryCachingEnabled && result) {
    await redis.set(cacheKey, result, { EX: queryCachingTTL });
  }
  return result;
}

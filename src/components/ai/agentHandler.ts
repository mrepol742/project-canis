import { openrouter, generateText } from "./openRouter";
import { groq } from "./groq";
import { gemini } from "./gemini";
import redis from "../redis";

const aiProvider = process.env.AI_PROVIDER || "groq";
const isQueryCachingEnabled = process.env.ALLOW_QUERY_CACHING === "true";
const queryCachingCount = parseInt(
  process.env.QUERY_CACHING_COUNT || "1000",
  10
);
const queryCachingTTL = parseInt(process.env.QUERY_CACHING_TTL || "3600", 10);
const openRouterModel =
  process.env.OPEN_ROUTER_MODEL || "moonshotai/kimi-k2:free";
const groqModel =
  process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash-001";

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
  /*
   * OpenRouter
   * https://openrouter.ai/docs/api-reference
   */
  if (aiProvider === "openrouter") {
    const { text } = await generateText({
      model: openrouter(model || openRouterModel),
      prompt: prompt,
    });
    result = text;

    /*
     * Groq
     * https://console.groq.com/docs/api-reference
     */
  } else if (aiProvider === "groq") {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model || groqModel,
    });
    result = chatCompletion.choices[0].message.content;

    /*
     * Gemini
     * https://github.com/googleapis/js-genai
     */
  } else if (aiProvider === "gemini") {
    const generateContent = await gemini.models.generateContent({
      model: model || geminiModel,
      contents: prompt,
    });
    result = generateContent.text || null;

    /*
     * Error handling for unsupported AI providers
     */
  } else {
    throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }

  if (isQueryCachingEnabled && result) {
    await redis.set(cacheKey, result, { EX: queryCachingTTL });
  }
  return result;
}

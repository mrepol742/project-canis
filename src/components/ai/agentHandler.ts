import crypto from "crypto";
import { openrouter, generateText } from "./openRouter";
import { groq } from "./groq";
import { gemini } from "./gemini";
import { openai } from "./openAi";
import ollama from "ollama";
import redis from "../redis";
import {
  AI_PROVIDER,
  ALLOW_QUERY_CACHING,
  GEMINI_MODEL,
  GROQ_MODEL,
  OLLAMA_MODEL,
  OPEN_ROUTER_MODEL,
  OPENAI_MODEL,
  QUERY_CACHING_TTL,
} from "../../config";

function getCacheKey(prompt: string): string {
  const hash = crypto.createHash("sha256").update(prompt).digest("hex");
  return `ai:prompt:${hash}`;
}

export default async function (
  prompt: string,
  model?: string,
): Promise<string | null> {
  const cacheKey = getCacheKey(prompt);
  const today = new Date().toUTCString();
  prompt = prompt.replace("%_TODAY_%", today);

  if (ALLOW_QUERY_CACHING) {
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
  if (AI_PROVIDER === "openrouter") {
    const { text } = await generateText({
      model: openrouter(model || OPEN_ROUTER_MODEL),
      prompt: prompt,
    });
    result = text;

    /*
     * Groq
     * https://console.groq.com/docs/api-reference
     */
  } else if (AI_PROVIDER === "groq") {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model || GROQ_MODEL,
    });
    result = chatCompletion.choices[0].message.content;

    /*
     * Gemini
     * https://github.com/googleapis/js-genai
     */
  } else if (AI_PROVIDER === "gemini") {
    const generateContent = await gemini.models.generateContent({
      model: model || GEMINI_MODEL,
      contents: prompt,
    });
    result = generateContent.text || null;

    /*
     * OpenAI
     * https://platform.openai.com/docs/api-reference
     */
  } else if (AI_PROVIDER === "openai") {
    const chatCompletion = await openai.chat.completions.create({
      model: model || OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
    });
    result = chatCompletion.choices[0].message.content;

    /*
     * Ollama
     * https://github.com/ollama/ollama/tree/main/docs
     */
  } else if (AI_PROVIDER === "ollama") {
    const response = await ollama.chat({
      model: model || OLLAMA_MODEL,
      messages: [{ role: "user", content: prompt }],
    });
    result = response.message.content || null;

    /*
     * Error handling for unsupported AI providers
     */
  } else {
    throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
  }

  if (ALLOW_QUERY_CACHING && result) {
    await redis.set(cacheKey, result, {
      expiration: {
        type: "EX",
        value: QUERY_CACHING_TTL,
      },
    });
  }
  return result;
}

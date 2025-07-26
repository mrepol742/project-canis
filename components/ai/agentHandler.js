"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const openRouter_1 = require("./openRouter");
const groq_1 = require("./groq");
const gemini_1 = require("./gemini");
const openAi_1 = require("./openAi");
const ollama_1 = __importDefault(require("ollama"));
const redis_1 = __importDefault(require("../redis"));
const aiProvider = process.env.AI_PROVIDER || "groq";
const isQueryCachingEnabled = process.env.ALLOW_QUERY_CACHING === "true";
const queryCachingCount = parseInt(process.env.QUERY_CACHING_COUNT || "1000", 10);
const queryCachingTTL = parseInt(process.env.QUERY_CACHING_TTL || "3600", 10);
const openRouterModel = process.env.OPEN_ROUTER_MODEL || "moonshotai/kimi-k2:free";
const groqModel = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash-001";
const openAiModel = process.env.OPENAI_MODEL || "gpt-4o";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.1";
function getCacheKey(prompt) {
    return `ai:prompt:${Buffer.from(prompt).toString("base64")}`;
}
async function default_1(prompt, model) {
    const cacheKey = getCacheKey(prompt);
    if (isQueryCachingEnabled) {
        const cached = await redis_1.default.get(cacheKey);
        if (cached) {
            return cached;
        }
    }
    let result;
    if (aiProvider === "openrouter") {
        const { text } = await (0, openRouter_1.generateText)({
            model: (0, openRouter_1.openrouter)(model || openRouterModel),
            prompt: prompt,
        });
        result = text;
    }
    else if (aiProvider === "groq") {
        const chatCompletion = await groq_1.groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: model || groqModel,
        });
        result = chatCompletion.choices[0].message.content;
    }
    else if (aiProvider === "gemini") {
        const generateContent = await gemini_1.gemini.models.generateContent({
            model: model || geminiModel,
            contents: prompt,
        });
        result = generateContent.text || null;
    }
    else if (aiProvider === "openai") {
        const chatCompletion = await openAi_1.openai.chat.completions.create({
            model: model || openAiModel,
            messages: [{ role: "user", content: prompt }],
        });
        result = chatCompletion.choices[0].message.content;
    }
    else if (aiProvider === "ollama") {
        const response = await ollama_1.default.chat({
            model: model || ollamaModel,
            messages: [{ role: "user", content: prompt }],
        });
        result = response.message.content || null;
    }
    else {
        throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }
    if (isQueryCachingEnabled && result) {
        await redis_1.default.set(cacheKey, result, { EX: queryCachingTTL });
    }
    return result;
}

import OpenAI from "openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { OPEN_ROUTER_API_KEY } from "../../config";

// AI SDK provider (used in agentHandler for simple completions)
let _provider: ReturnType<typeof createOpenRouter> | null = null;
export function getOpenRouter(): ReturnType<typeof createOpenRouter> {
  if (!_provider) _provider = createOpenRouter({ apiKey: OPEN_ROUTER_API_KEY });
  return _provider;
}

// OpenAI-compatible client (used in agentRunner for the tool-calling loop)
let _oaiClient: OpenAI | null = null;
export function getOpenRouterOAI(): OpenAI {
  if (!_oaiClient) {
    _oaiClient = new OpenAI({
      apiKey: OPEN_ROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return _oaiClient;
}

export { generateText };

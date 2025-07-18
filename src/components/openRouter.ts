import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openRouterApiKey = process.env.OPEN_ROUTER_API_KEY;
const openrouter = createOpenRouter({ apiKey: openRouterApiKey });

export { openrouter, openRouterApiKey, generateText };
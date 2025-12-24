import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { OPEN_ROUTER_API_KEY } from "../../config";

const openrouter = createOpenRouter({
  apiKey: OPEN_ROUTER_API_KEY,
});

export { openrouter, generateText };

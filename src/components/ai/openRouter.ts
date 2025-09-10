import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY || "",
});

export { openrouter, generateText };

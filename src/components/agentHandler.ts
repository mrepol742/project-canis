import { openrouter, generateText } from "./openRouter";
import { groq } from "./groq";

const aiProvider = process.env.AI_PROVIDER || "groq";

export default async function agentHandler(prompt: string, model?: string) {
  if (aiProvider === "openrouter") {
    const { text } = await generateText({
      model: openrouter(model || "moonshotai/kimi-k2:free"),
      prompt: prompt,
    });

    return text;
  } else if (aiProvider === "groq") {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model || "meta-llama/llama-4-scout-17b-16e-instruct",
    });

    return chatCompletion.choices[0].message.content;
  } else {
    throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}

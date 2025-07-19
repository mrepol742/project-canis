"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = agentHandler;
const openRouter_1 = require("./openRouter");
const groq_1 = require("./groq");
const aiProvider = process.env.AI_PROVIDER || "groq";
async function agentHandler(prompt, model) {
    if (aiProvider === "openrouter") {
        const { text } = await (0, openRouter_1.generateText)({
            model: (0, openRouter_1.openrouter)(model || "moonshotai/kimi-k2:free"),
            prompt: prompt,
        });
        return text;
    }
    else if (aiProvider === "groq") {
        const chatCompletion = await groq_1.groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: model || "meta-llama/llama-4-scout-17b-16e-instruct",
        });
        return chatCompletion.choices[0].message.content;
    }
    else {
        throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.info = void 0;
exports.default = default_1;
const promises_1 = __importDefault(require("fs/promises"));
const whatsapp_web_js_1 = require("whatsapp-web.js");
const log_1 = __importDefault(require("../components/utils/log"));
const gemini_1 = require("../components/ai/gemini");
exports.info = {
    command: "nano",
    description: "Create a picture using nano banana model.",
    usage: "nano <prompt>",
    example: "nano Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme",
    role: "user",
    cooldown: 5000,
};
async function default_1(msg) {
    const query = msg.body.replace(/^nano\s+/i, "").trim();
    if (query.length === 0) {
        await msg.reply("Please provide a prompt.");
        return;
    }
    if (!gemini_1.gemini) {
        return log_1.default.error("nano", "Unable to process `nano` Gemini is not yet setup.");
    }
    const response = await gemini_1.gemini.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: [
            {
                role: "user",
                parts: [{ text: query }],
            },
        ],
    });
    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
        await msg.reply("No image was generated. Try a different prompt.");
        return;
    }
    const tempDir = "./.temp";
    await promises_1.default.mkdir(tempDir, { recursive: true });
    const tempPath = `${tempDir}/${Date.now()}.png`;
    for (const part of candidate.content.parts) {
        if (part.text) {
            await msg.reply(part.text);
        }
        else if (part.inlineData?.data) {
            const buffer = Buffer.from(part.inlineData.data, "base64");
            await promises_1.default.writeFile(tempPath, buffer);
            const media = whatsapp_web_js_1.MessageMedia.fromFilePath(tempPath);
            await msg.reply(media);
            await promises_1.default.unlink(tempPath);
        }
    }
}

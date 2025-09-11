import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs/promises";
import { MessageMedia } from "whatsapp-web.js";
import { Message } from "../../types/message"
import log from "../components/utils/log";
import { gemini } from "../components/ai/gemini";

export const info = {
  command: "nano",
  description: "Create a picture using nano banana model.",
  usage: "nano <prompt>",
  example:
    "nano Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme",
  role: "user",
  cooldown: 5000,
};

export default async function (msg: Message) {
  const query = msg.body.replace(/^nano\s+/i, "").trim();
  if (query.length === 0) {
    await msg.reply("Please provide a prompt.");
    return;
  }

  if (!gemini) {
    return log.error(
      "nano",
      "Unable to process `nano` Gemini is not yet setup.",
    );
  }

  const response = await gemini.models.generateContent({
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
  await fs.mkdir(tempDir, { recursive: true });
  const tempPath = `${tempDir}/${Date.now()}.png`;

  for (const part of candidate.content.parts) {
    if (part.text) {
      await msg.reply(part.text);
    } else if (part.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, "base64");

      await fs.writeFile(tempPath, buffer);

      const media = MessageMedia.fromFilePath(tempPath);
      await msg.reply(media);
      await fs.unlink(tempPath);
    }
  }
}

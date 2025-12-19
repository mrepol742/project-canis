import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../../config";

const client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export { client as gemini };

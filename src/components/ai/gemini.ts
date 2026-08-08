import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../../config";

let _client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!_client) _client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return _client;
}

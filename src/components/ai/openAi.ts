import OpenAI from "openai";
import { OPENAI_API_KEY } from "../../config";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: OPENAI_API_KEY });
  return _client;
}

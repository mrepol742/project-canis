import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../../config";

let _client: Groq | null = null;

export function getGroq(): Groq {
  if (!_client) _client = new Groq({ apiKey: GROQ_API_KEY });
  return _client;
}

import OpenAI from "openai";
import { OPENAI_API_KEY } from "../../config";

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export { client as openai };

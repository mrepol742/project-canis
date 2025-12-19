import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../../config";

const client = new Groq({
  apiKey: GROQ_API_KEY,
});

export { client as groq };

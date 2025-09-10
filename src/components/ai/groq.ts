import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export { client as groq };

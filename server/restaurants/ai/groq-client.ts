import { createGroq } from "@ai-sdk/groq";

const DEFAULT_MODEL = "openai/gpt-oss-120b";

export const getGroqModel = () => {
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
  const modelId = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
  return groq(modelId);
};

export const getGroqModelId = (): string =>
  process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;

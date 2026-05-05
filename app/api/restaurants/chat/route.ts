import type { UIMessage } from "ai";
import { assistantAgent } from "@/server/restaurants/ai/assistant-agent";
import { getGroqModelId } from "@/server/restaurants/ai/groq-client";

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return Response.json({ error: "GROQ_API_KEY is not configured" }, { status: 503 });
  }

  const body = (await req.json()) as { messages: UIMessage[] };
  const { messages } = body;

  console.log("[restaurants/chat] request", {
    modelId: getGroqModelId(),
    messageCount: messages.length,
  });

  return assistantAgent.run({ messages });
}

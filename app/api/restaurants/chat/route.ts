import { createGroq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import type { CuisineType } from "@/app/generated/prisma/client";
import { CUISINE_LABEL, CUISINE_OPTIONS } from "@/lib/cuisines";
import { buildRestaurantAssistantSystemPrompt } from "@/server/restaurants/ai/assistant-system-prompt";
import { restaurantRepository } from "@/server/restaurants/repositories/restaurant.repository";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const defaultModel = "llama-3.3-70b-versatile";

const cuisineTuple = CUISINE_OPTIONS.map((c) => c.value) as [CuisineType, ...CuisineType[]];

const searchRestaurantsInputSchema = z.object({
  city_contains: z
    .string()
    .optional()
    .describe("User's city or area phrase; substring match on restaurant city."),
  cuisine_tags: z
    .array(z.enum(cuisineTuple))
    .optional()
    .describe(
      "Catalog tag(s) you mapped from user intent. Restaurant matches if it has ANY of these tags. Omit for city-only browse.",
    ),
});

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return Response.json({ error: "GROQ_API_KEY is not configured" }, { status: 503 });
  }

  const body = (await req.json()) as { messages: UIMessage[] };
  const { messages } = body;

  const modelId = process.env.GROQ_MODEL?.trim() || defaultModel;
  console.log("[restaurants/chat] request", { modelId, messageCount: messages.length });

  const search_restaurants = tool({
    description: `Query TableSpot restaurants. Name: search_restaurants. Keys: city_contains (optional), cuisine_tags (optional array of catalog codes). At least one must be set. See system prompt for tag list and mapping rules.`,
    inputSchema: searchRestaurantsInputSchema,
    strict: false,
    execute: async (input) => {
      const cityContains = input.city_contains?.trim() || undefined;
      const cuisineTags = input.cuisine_tags?.length ? input.cuisine_tags : undefined;

      if (!cityContains && !cuisineTags?.length) {
        console.log("[restaurants/chat] search_restaurants: no filters, empty result");
        return {
          restaurants: [],
          assistantNote:
            "Provide city_contains and/or cuisine_tags (catalog codes from the system prompt).",
        };
      }

      const rows = await restaurantRepository.findManyForChat({
        cityContains,
        cuisineTags,
      });

      console.log("[restaurants/chat] search_restaurants: db rows", rows.length, {
        cityContains,
        cuisineTags,
      });

      return {
        restaurants: rows.map((r) => ({
          id: r.id,
          name: r.name,
          city: r.city,
          cuisines: r.cuisines.map((c) => CUISINE_LABEL[c]),
        })),
      };
    },
  });

  const tools = { search_restaurants };

  const system = buildRestaurantAssistantSystemPrompt();

  const result = streamText({
    model: groq(modelId),
    system,
    messages: await convertToModelMessages(messages, { tools }),
    tools,
    stopWhen: stepCountIs(15),
    providerOptions: {
      groq: {
        parallelToolCalls: false,
        strictJsonSchema: false,
      },
    },
    experimental_onStepStart: ({ stepNumber }) => {
      console.log("[restaurants/chat] step start", stepNumber);
    },
    onStepFinish: (step) => {
      console.log("[restaurants/chat] step finish", {
        step: step.stepNumber,
        finishReason: step.finishReason,
        textLength: step.text.length,
        toolCallCount: step.toolCalls.length,
        toolResultCount: step.toolResults.length,
      });
      for (const tc of step.toolCalls) {
        console.log("[restaurants/chat]   tool call", tc.toolName, tc.input);
      }
    },
    experimental_onToolCallStart: ({ stepNumber, toolCall }) => {
      console.log("[restaurants/chat] tool execute start", {
        step: stepNumber,
        name: toolCall.toolName,
        input: toolCall.input,
      });
    },
    experimental_onToolCallFinish: (event) => {
      if (event.success) {
        const out = event.output as { restaurants?: unknown[] } | undefined;
        const n = out?.restaurants?.length;
        console.log("[restaurants/chat] tool execute done", {
          name: event.toolCall.toolName,
          ms: event.durationMs,
          restaurantCount: n,
        });
      } else {
        console.log("[restaurants/chat] tool execute failed", {
          name: event.toolCall.toolName,
          ms: event.durationMs,
          error: event.error,
        });
      }
    },
    onFinish: (event) => {
      console.log("[restaurants/chat] run done", {
        steps: event.steps.length,
        finishReason: event.finishReason,
        usage: event.totalUsage,
      });
    },
    onError: (event) => {
      console.error("[restaurants/chat]", event.error);
    },
  });

  return result.toUIMessageStreamResponse();
}

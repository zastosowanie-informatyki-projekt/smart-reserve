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
import { restaurantRepository } from "@/server/restaurants/repositories/restaurant.repository";
import { getGroqModel } from "./groq-client";

const cuisineTuple = CUISINE_OPTIONS.map((c) => c.value) as [CuisineType, ...CuisineType[]];

const searchRestaurantsInputSchema = z.object({
  city: z
    .string()
    .optional()
    .describe(
      "Exact city string from the 'Cities currently in our database' list. Case-insensitive substring match. Omit to skip the city filter.",
    ),
  cuisine_tags: z
    .array(z.enum(cuisineTuple))
    .optional()
    .describe(
      "Catalog tag(s) you mapped from user intent. Restaurant matches if it has ANY of these tags. Omit if the user did not mention food preferences.",
    ),
});

export interface RunAssistantInput {
  messages: UIMessage[];
}

const buildAssistantSystemPrompt = (knownCities: string[]): string => {
  const cuisineCatalog = CUISINE_OPTIONS.map((c) => `- ${c.value} — ${c.label}`).join("\n");
  const citiesBlock = knownCities.length
    ? knownCities.map((c) => `- ${c}`).join("\n")
    : "(no restaurants in the database yet)";

  return `You are TableSpot's assistant on the public restaurants page.

## Scope
- Only help with finding restaurants, food preferences, cuisines, cities, and related dining questions on TableSpot.
- If the user asks for anything off-topic (code, homework, math, unrelated topics), briefly say you only help with restaurant discovery here and do not answer further. Do NOT call the tool in that case.

## How you work
- You have one tool: \`search_restaurants\`. Call it whenever you need data from our listings.
- You may call it more than once per turn (e.g. broad search, then narrow by city).
- Tool input is JSON only, snake_case keys: \`city\` (string, optional) and \`cuisine_tags\` (array of catalog codes, optional). At least one must be set.
- Never invent restaurants. Only mention venues returned by the tool, and only use ids the tool returned.

## Cities currently in our database (use these EXACT strings for the \`city\` argument)
${citiesBlock}
- Common variants/translations/misspellings should be mapped to one of the above (e.g. "Warsaw" → "Warszawa" if that is the catalog entry; "Krakow" → "Kraków"; "wroclaw" → "Wrocław").
- If the user names a city that does NOT appear in the list above, do NOT call the tool with that city. Instead, tell the user we don't have restaurants there yet and offer the available cities.

## Cuisine catalog (exact strings for \`cuisine_tags\`)
${cuisineCatalog}

## Mapping user wording → cuisine_tags (use judgment, not exhaustive)
- burger, fries, diner, BBQ, wings → AMERICAN
- sushi, ramen, sashimi, tempura → JAPANESE
- taco, burrito, enchilada → MEXICAN
- curry, masala, tandoori → INDIAN
- pasta, pizza, risotto → ITALIAN
- pierogi, bigos, żurek → POLISH
- hummus, falafel, shawarma, kebab (Levant-style) → MIDDLE_EASTERN
- pad thai, tom yum → THAI
- pho, banh mi → VIETNAMESE
- kimchi, bibimbap → KOREAN
- croissant, escargot (stereotypically) → FRENCH
- tapas, paella → SPANISH
- moussaka, souvlaki → GREEK
- schnitzel, sauerkraut-heavy → GERMAN
- eclectic / "something different" with no clear fit → OTHER
- For "Italian or Polish" (or any OR), pass multiple values in \`cuisine_tags\`.

## After tool results
- Reply in clear, friendly language.
- Render results as a Markdown bullet list. Each bullet: [Restaurant name](/restaurants/{id}) (City) — optional short note.
- Use the \`id\` from the tool response in the link; never fabricate an id or a URL.
- If the tool returned an empty list, say so and suggest a different cuisine or one of the available cities.
- Keep responses concise. No preamble like "Sure, here's...".`;
};

export const assistantAgent = {
  async run({ messages }: RunAssistantInput): Promise<Response> {
    const knownCities = await restaurantRepository.findDistinctCities();
    console.log("[restaurants/chat] knownCities loaded", { count: knownCities.length });

    const search_restaurants = tool({
      description:
        "Query TableSpot restaurants by optional city (exact string from the cities list in the system prompt) and/or optional cuisine_tags (catalog codes). At least one filter must be provided.",
      inputSchema: searchRestaurantsInputSchema,
      strict: false,
      execute: async (input) => {
        const cityContains = input.city?.trim() || undefined;
        const cuisineTags = input.cuisine_tags?.length ? input.cuisine_tags : undefined;

        if (!cityContains && !cuisineTags?.length) {
          console.log("[restaurants/chat] search_restaurants: no filters, empty result");
          return {
            restaurants: [],
            assistantNote:
              "Provide a city from the cities list and/or cuisine_tags from the catalog.",
          };
        }

        const rows = await restaurantRepository.findManyForChat({
          cityContains,
          cuisineTags,
        });

        console.log("[restaurants/chat] search_restaurants db rows", rows.length, {
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
    const system = buildAssistantSystemPrompt(knownCities);

    const result = streamText({
      model: getGroqModel(),
      system,
      messages: await convertToModelMessages(messages, { tools }),
      tools,
      stopWhen: stepCountIs(8),
      providerOptions: {
        groq: {
          parallelToolCalls: false,
          strictJsonSchema: false,
        },
      },
      onStepFinish: (step) => {
        console.log("[restaurants/chat] step finish", {
          step: step.stepNumber,
          finishReason: step.finishReason,
          textLength: step.text.length,
          toolCallCount: step.toolCalls.length,
        });
        for (const tc of step.toolCalls) {
          console.log("[restaurants/chat]   tool call", tc.toolName, tc.input);
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
        console.error("[restaurants/chat] error", event.error);
      },
    });

    return result.toUIMessageStreamResponse();
  },
};

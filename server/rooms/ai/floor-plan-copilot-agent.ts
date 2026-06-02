import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { computeTableLayout } from "@/lib/floor-plan-copilot/compute-table-layout";
import {
  copilotDecorationSchema,
  copilotRoomShapeSchema,
  copilotTableCapacitySchema,
  copilotTableLayoutSchema,
  floorPlanCopilotContextSchema,
  type CopilotToolResult,
  type FloorPlanCopilotContext,
} from "@/lib/floor-plan-copilot/types";
import { getGroqModel } from "@/server/restaurants/ai/groq-client";

export interface RunFloorPlanCopilotInput {
  messages: UIMessage[];
  context: FloorPlanCopilotContext;
}

const buildSystemPrompt = (context: FloorPlanCopilotContext): string => {
  const tableCount = context.elements.filter((el) => el.type === "table").length;
  const wallCount = context.elements.filter(
    (el) => el.type === "decoration" && (el.shape === "line" || el.decorationPreset === "wall"),
  ).length;

  return `You are TableSpot's floor plan copilot for restaurant owners.

## Scope
- Only help layout the active room on the floor plan editor: walls/outlines, tables, doors, windows, toilets.
- Use tools to inspect the room and emit layout actions. Never describe changes you did not apply via tools.
- Changes are local until the owner clicks Save — remind them if they ask about persistence.

## Active room
- Name: ${context.roomName}
- Canvas: ${context.canvasWidth}×${context.canvasHeight}px
- Tables on canvas: ${tableCount}
- Wall segments: ${wallCount}

## Tool rules
- Call \`get_room_state\` first when you need current layout details.
- Table capacities must be 2, 4, or 6 (matching seat presets).
- Room outlines: rectangle, square, or l-shape. Applying an outline replaces existing walls only.
- After tools run, briefly confirm what you did in plain language (Polish or English, matching the user).

## Layout hints
- Prefer grid for many tables, row for a single line along a wall.
- Do not place elements outside the canvas.`;
};

export const floorPlanCopilotAgent = {
  async run({ messages, context }: RunFloorPlanCopilotInput): Promise<Response> {
    const parsedContext = floorPlanCopilotContextSchema.parse(context);

    const get_room_state = tool({
      description: "Return a summary of the current room layout on the canvas.",
      inputSchema: z.object({}),
      strict: false,
      execute: async (): Promise<CopilotToolResult> => {
        const tables = parsedContext.elements.filter((el) => el.type === "table");
        const walls = parsedContext.elements.filter(
          (el) => el.type === "decoration" && (el.shape === "line" || el.decorationPreset === "wall"),
        );
        const decorations = parsedContext.elements.filter(
          (el) =>
            el.type === "decoration" &&
            el.shape !== "line" &&
            el.decorationPreset !== "wall",
        );

        return {
          summary: `Room "${parsedContext.roomName}": ${tables.length} tables, ${walls.length} wall segments, ${decorations.length} other elements.`,
          actions: [],
          room: {
            name: parsedContext.roomName,
            canvasWidth: parsedContext.canvasWidth,
            canvasHeight: parsedContext.canvasHeight,
            tables: tables.map((t) => ({
              label: t.label,
              capacity: t.capacity,
              x: t.x,
              y: t.y,
            })),
            wallCount: walls.length,
            decorations: decorations.map((d) => ({
              preset: d.decorationPreset,
              label: d.label,
              x: d.x,
              y: d.y,
            })),
          },
        };
      },
    });

    const apply_room_outline = tool({
      description:
        "Apply a predefined room wall outline. Replaces existing walls; keeps tables and other elements.",
      inputSchema: z.object({
        shape: copilotRoomShapeSchema,
      }),
      strict: false,
      execute: async (input): Promise<CopilotToolResult> => ({
        summary: `Applied ${input.shape} room outline.`,
        actions: [{ type: "apply_room_outline", shape: input.shape }],
      }),
    });

    const add_tables = tool({
      description:
        "Add multiple tables with preset sizes (2, 4, or 6 seats). Positions are computed automatically in a grid or row.",
      inputSchema: z.object({
        count: z.number().int().min(1).max(24),
        capacity: copilotTableCapacitySchema,
        layout: copilotTableLayoutSchema.default("grid"),
        label_prefix: z.string().optional(),
      }),
      strict: false,
      execute: async (input): Promise<CopilotToolResult> => {
        const action = computeTableLayout({
          count: input.count,
          capacity: input.capacity,
          layout: input.layout,
          context: parsedContext,
          labelPrefix: input.label_prefix,
        });

        return {
          summary: `Placed ${input.count} table(s) for ${input.capacity} guests (${input.layout} layout).`,
          actions: [action],
        };
      },
    });

    const remove_walls = tool({
      description: "Remove all wall segments from the room. Keeps tables and other decorations.",
      inputSchema: z.object({}),
      strict: false,
      execute: async (): Promise<CopilotToolResult> => ({
        summary: "Removed all wall segments.",
        actions: [{ type: "remove_walls" }],
      }),
    });

    const add_decoration = tool({
      description: "Add a door, window, or toilet at a canvas position (top-left corner, grid-aligned).",
      inputSchema: z.object({
        decoration: copilotDecorationSchema,
        x: z.number().optional(),
        y: z.number().optional(),
      }),
      strict: false,
      execute: async (input): Promise<CopilotToolResult> => {
        const x = input.x ?? Math.round(parsedContext.canvasWidth / 2 / 20) * 20 - 40;
        const y = input.y ?? Math.round(parsedContext.canvasHeight / 2 / 20) * 20 - 20;

        return {
          summary: `Added ${input.decoration} at (${x}, ${y}).`,
          actions: [
            {
              type: "add_decoration",
              decoration: input.decoration,
              x,
              y,
            },
          ],
        };
      },
    });

    const tools = {
      get_room_state,
      apply_room_outline,
      add_tables,
      remove_walls,
      add_decoration,
    };

    const result = streamText({
      model: getGroqModel(),
      system: buildSystemPrompt(parsedContext),
      messages: await convertToModelMessages(messages, { tools }),
      tools,
      stopWhen: stepCountIs(8),
      providerOptions: {
        groq: {
          parallelToolCalls: false,
          strictJsonSchema: false,
        },
      },
    });

    return result.toUIMessageStreamResponse();
  },
};

import { z } from "zod";

export const floorPlanCopilotContextSchema = z.object({
  activeRoomId: z.string().min(1),
  roomName: z.string(),
  canvasWidth: z.number().positive(),
  canvasHeight: z.number().positive(),
  elements: z.array(
    z.object({
      type: z.enum(["table", "decoration"]),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      capacity: z.number().optional(),
      decorationPreset: z.string().optional(),
      shape: z.string().optional(),
      label: z.string().optional(),
    }),
  ),
});

export type FloorPlanCopilotContext = z.infer<typeof floorPlanCopilotContextSchema>;

export const copilotRoomShapeSchema = z.enum(["rectangle", "square", "l-shape"]);
export const copilotTableCapacitySchema = z.union([z.literal(2), z.literal(4), z.literal(6)]);
export const copilotTableLayoutSchema = z.enum(["grid", "row"]);
export const copilotDecorationSchema = z.enum(["door", "window", "toilet"]);

export const copilotActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("apply_room_outline"), shape: copilotRoomShapeSchema }),
  z.object({ type: z.literal("remove_walls") }),
  z.object({
    type: z.literal("add_tables"),
    tables: z.array(
      z.object({
        label: z.string(),
        capacity: copilotTableCapacitySchema,
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        shape: z.enum(["rect", "circle"]),
      }),
    ),
  }),
  z.object({
    type: z.literal("add_decoration"),
    decoration: copilotDecorationSchema,
    x: z.number(),
    y: z.number(),
  }),
]);

export type CopilotAction = z.infer<typeof copilotActionSchema>;

export interface CopilotToolResult {
  summary: string;
  actions: CopilotAction[];
  room?: {
    name: string;
    canvasWidth: number;
    canvasHeight: number;
    tables: Array<{ label?: string; capacity?: number; x: number; y: number }>;
    wallCount: number;
    decorations: Array<{ preset?: string; label?: string; x: number; y: number }>;
  };
}

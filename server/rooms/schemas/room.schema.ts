import { z } from "zod";

export const createRoomSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant ID is required"),
  name: z.string().min(1, "Room name is required"),
  description: z.string().optional(),
});

export const updateRoomSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
  name: z.string().min(1, "Room name is required").optional(),
  description: z.string().optional(),
});

const floorPlanTableElementSchema = z.object({
  id: z.string().min(1),
  type: z.literal("table"),
  tableId: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
  shape: z.enum(["rect", "circle"]),
});

const floorPlanDecorationElementSchema = z.object({
  id: z.string().min(1),
  type: z.literal("decoration"),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().optional(),
  shape: z.enum(["rect", "circle", "line"]),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  label: z.string().optional(),
});

export const floorPlanSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  elements: z.array(
    z.discriminatedUnion("type", [
      floorPlanTableElementSchema,
      floorPlanDecorationElementSchema,
    ]),
  ),
});

export const saveFloorPlanSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  floorPlan: floorPlanSchema,
});

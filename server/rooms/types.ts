import type { z } from "zod";
import type {
  createRoomSchema,
  updateRoomSchema,
  saveFloorPlanSchema,
  floorPlanSchema,
} from "./schemas/room.schema";

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type SaveFloorPlanInput = z.infer<typeof saveFloorPlanSchema>;
export type FloorPlan = z.infer<typeof floorPlanSchema>;
export type FloorPlanElement = FloorPlan["elements"][number];
export type FloorPlanTableElement = Extract<FloorPlanElement, { type: "table" }>;
export type FloorPlanDecorationElement = Extract<FloorPlanElement, { type: "decoration" }>;

export interface FloorPlanTableElementWithMeta extends FloorPlanTableElement {
  table: {
    label: string;
    capacity: number;
    isActive: boolean;
  } | null;
}

export type EnrichedFloorPlanElement =
  | FloorPlanTableElementWithMeta
  | FloorPlanDecorationElement;

export interface EnrichedFloorPlan {
  width: number;
  height: number;
  elements: EnrichedFloorPlanElement[];
}

export interface RoomWithFloorPlan {
  id: string;
  name: string;
  description: string | null;
  floorPlan: EnrichedFloorPlan | null;
}

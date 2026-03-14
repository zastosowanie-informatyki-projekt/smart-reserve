"use server";

import type { ActionResult } from "@/lib/types";
import { roomService } from "../services/room.service";
import type { RoomWithFloorPlan } from "../types";

export async function getFloorPlan(
  restaurantId: string,
): Promise<ActionResult<RoomWithFloorPlan[]>> {
  try {
    const rooms = await roomService.getFloorPlan(restaurantId);
    return { success: true, data: rooms };
  } catch (error) {
    console.error("Failed to get floor plan:", error);
    return { success: false, error: "Failed to get floor plan" };
  }
}

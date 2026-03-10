"use server";

import type { ActionResult } from "@/lib/types";
import { roomService } from "../services/room.service";

export async function getRooms(restaurantId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      tables: Array<{
        id: string;
        label: string;
        capacity: number;
        description: string | null;
        isActive: boolean;
      }>;
    }>
  >
> {
  try {
    const rooms = await roomService.findByRestaurantId(restaurantId);
    return { success: true, data: rooms };
  } catch (error) {
    console.error("Failed to get rooms:", error);
    return { success: false, error: "Failed to get rooms" };
  }
}

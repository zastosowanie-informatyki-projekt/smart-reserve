"use server";

import type { ActionResult } from "@/lib/types";
import { restaurantService } from "../services/restaurant.service";

export async function deleteRestaurant(id: string): Promise<ActionResult> {
  try {
    await restaurantService.delete(id);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete restaurant:", error);
    return { success: false, error: "Failed to delete restaurant" };
  }
}

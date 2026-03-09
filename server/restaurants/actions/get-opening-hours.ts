"use server";

import type { ActionResult } from "@/lib/types";
import { restaurantService } from "../services/restaurant.service";

export async function getOpeningHours(restaurantId: string): Promise<
  ActionResult<
    Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>
  >
> {
  try {
    const hours = await restaurantService.findOpeningHours(restaurantId);
    return { success: true, data: hours };
  } catch (error) {
    console.error("Failed to get opening hours:", error);
    return { success: false, error: "Failed to get opening hours" };
  }
}

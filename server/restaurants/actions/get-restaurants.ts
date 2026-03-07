"use server";

import type { ActionResult } from "@/lib/types";
import { restaurantService } from "../services/restaurant.service";

export async function getRestaurants(filters?: {
  city?: string;
  cuisine?: string;
}): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      description: string | null;
      address: string;
      city: string;
      cuisine: string | null;
      imageUrl: string | null;
    }>
  >
> {
  try {
    const restaurants = await restaurantService.findMany(filters);
    return { success: true, data: restaurants };
  } catch (error) {
    console.error("Failed to get restaurants:", error);
    return { success: false, error: "Failed to get restaurants" };
  }
}

"use server";

import { CuisineType } from "@/app/generated/prisma/client";
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
      street: string;
      buildingNumber: string;
      city: string;
      cuisines: CuisineType[];
      imageUrl: string | null;
    }>
  >
> {
  try {
    const restaurants = await restaurantService.findMany({
      city: filters?.city,
      cuisine: filters?.cuisine as CuisineType | undefined,
    });
    return { success: true, data: restaurants };
  } catch (error) {
    console.error("Failed to get restaurants:", error);
    return { success: false, error: "Failed to get restaurants" };
  }
}

"use server";

import { CuisineType } from "@/app/generated/prisma/client";
import type { ActionResult } from "@/lib/types";
import { restaurantService } from "../services/restaurant.service";

export async function getRestaurant(id: string): Promise<
  ActionResult<{
    id: string;
    name: string;
    description: string | null;
    street: string;
    buildingNumber: string;
    city: string;
    phone: string | null;
    email: string | null;
    imageUrl: string | null;
    website: string | null;
    cuisines: CuisineType[];
    ownerId: string;
    createdAt: Date;
    openingHours: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
    photos: Array<{
      id: string;
      url: string;
      altText: string | null;
      order: number;
    }>;
  }>
> {
  try {
    const restaurant = await restaurantService.findById(id);
    return { success: true, data: restaurant };
  } catch (error) {
    console.error("Failed to get restaurant:", error);
    return { success: false, error: "Failed to get restaurant" };
  }
}

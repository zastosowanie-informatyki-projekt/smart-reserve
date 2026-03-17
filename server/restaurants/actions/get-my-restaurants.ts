"use server";

import { CuisineType } from "@/app/generated/prisma/client";
import type { ActionResult } from "@/lib/types";
import { authService } from "@/server/auth/services/auth.service";
import { restaurantRepository } from "../repositories/restaurant.repository";

export async function getMyRestaurants(): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      city: string;
      cuisines: CuisineType[];
      createdAt: Date;
    }>
  >
> {
  try {
    const session = await authService.requireAuth();
    const restaurants = await restaurantRepository.findByOwnerId(
      session.user.id,
    );
    return { success: true, data: restaurants };
  } catch (error) {
    console.error("Failed to get my restaurants:", error);
    return { success: false, error: "Failed to get your restaurants" };
  }
}

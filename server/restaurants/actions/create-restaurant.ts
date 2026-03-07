"use server";

import type { ActionResult } from "@/lib/types";
import { createRestaurantSchema } from "../schemas/restaurant.schema";
import { restaurantService } from "../services/restaurant.service";

export async function createRestaurant(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createRestaurantSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    description: formData.get("description") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    cuisine: formData.get("cuisine") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const restaurant = await restaurantService.create(parsed.data);
    return { success: true, data: { id: restaurant.id } };
  } catch (error) {
    console.error("Failed to create restaurant:", error);
    return { success: false, error: "Failed to create restaurant" };
  }
}

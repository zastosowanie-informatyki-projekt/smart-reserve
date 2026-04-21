"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { updateRestaurantSchema } from "../schemas/restaurant.schema";
import { restaurantService } from "../services/restaurant.service";

export async function updateRestaurant(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateRestaurantSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    street: formData.get("street") || undefined,
    buildingNumber: formData.get("buildingNumber") || undefined,
    city: formData.get("city") || undefined,
    description: formData.get("description") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    website: formData.get("website") || undefined,
    cuisines: formData.getAll("cuisines") as string[],
    hasDisabledFacilities: formData.get("hasDisabledFacilities") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const restaurant = await restaurantService.update(parsed.data);
    revalidatePath(`/dashboard/${restaurant.id}`);
    revalidatePath(`/restaurants/${restaurant.id}`);
    return { success: true, data: { id: restaurant.id } };
  } catch (error) {
    console.error("Failed to update restaurant:", error);
    return { success: false, error: "Failed to update restaurant" };
  }
}

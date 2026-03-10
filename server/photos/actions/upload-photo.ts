"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { photoService } from "../services/photo.service";

export async function uploadPhoto(
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  const file = formData.get("file") as File | null;
  const restaurantId = formData.get("restaurantId") as string | null;

  if (!file || !file.size) {
    return { success: false, error: "No file provided" };
  }

  if (!restaurantId) {
    return { success: false, error: "Restaurant ID is required" };
  }

  if (!file.type.startsWith("image/")) {
    return { success: false, error: "File must be an image" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File must be smaller than 5MB" };
  }

  try {
    const photo = await photoService.upload(file, restaurantId);
    revalidatePath(`/dashboard/${restaurantId}`);
    revalidatePath(`/restaurants/${restaurantId}`);
    return { success: true, data: { id: photo.id, url: photo.url } };
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return { success: false, error: "Failed to upload photo" };
  }
}

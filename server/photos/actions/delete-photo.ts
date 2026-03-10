"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { photoService } from "../services/photo.service";

export async function deletePhoto(photoId: string): Promise<ActionResult> {
  try {
    await photoService.delete(photoId);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/restaurants", "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete photo:", error);
    return { success: false, error: "Failed to delete photo" };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { saveFloorPlanSchema } from "../schemas/room.schema";
import { roomService } from "../services/room.service";
import type { SaveFloorPlanInput } from "../types";

export async function saveFloorPlan(
  data: SaveFloorPlanInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = saveFloorPlanSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const result = await roomService.saveFloorPlan(parsed.data);
    revalidatePath(`/dashboard`);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save floor plan";
    console.error("Failed to save floor plan:", error);
    return { success: false, error: message };
  }
}

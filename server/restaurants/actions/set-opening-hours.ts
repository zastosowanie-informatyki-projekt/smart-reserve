"use server";

import type { ActionResult } from "@/lib/types";
import { setOpeningHoursSchema } from "../schemas/restaurant.schema";
import { restaurantService } from "../services/restaurant.service";

export async function setOpeningHours(
  input: unknown,
): Promise<ActionResult> {
  const parsed = setOpeningHoursSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await restaurantService.setOpeningHours(parsed.data);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to set opening hours:", error);
    return { success: false, error: "Failed to set opening hours" };
  }
}

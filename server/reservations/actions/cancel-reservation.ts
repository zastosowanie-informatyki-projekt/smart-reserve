"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { reservationService } from "../services/reservation.service";

export async function cancelReservation(
  id: string,
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    const result = await reservationService.cancel(id);
    revalidatePath("/reservations");
    revalidatePath("/dashboard", "layout");
    return { success: true, data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel reservation";
    console.error("Failed to cancel reservation:", error);
    return { success: false, error: message };
  }
}

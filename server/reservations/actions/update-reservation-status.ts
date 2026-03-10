"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { updateReservationStatusSchema } from "../schemas/reservation.schema";
import { reservationService } from "../services/reservation.service";

export async function updateReservationStatus(
  input: unknown,
): Promise<ActionResult<{ id: string; status: string }>> {
  const parsed = updateReservationStatusSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const result = await reservationService.updateStatus(
      parsed.data.id,
      parsed.data.status,
    );
    revalidatePath("/reservations");
    revalidatePath("/dashboard", "layout");
    return { success: true, data: result };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update reservation status";
    console.error("Failed to update reservation status:", error);
    return { success: false, error: message };
  }
}

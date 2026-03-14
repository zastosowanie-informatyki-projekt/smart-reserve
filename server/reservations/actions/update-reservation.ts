"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { updateReservationSchema } from "../schemas/reservation.schema";
import { reservationService } from "../services/reservation.service";

export async function updateReservation(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const guestCountRaw = formData.get("guestCount");
  const parsed = updateReservationSchema.safeParse({
    id: formData.get("id"),
    startTime: formData.get("startTime") || undefined,
    endTime: formData.get("endTime") || undefined,
    guestCount: guestCountRaw ? Number(guestCountRaw) : undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const reservation = await reservationService.update(parsed.data);
    revalidatePath("/reservations");
    return { success: true, data: { id: reservation.id } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update reservation";
    console.error("Failed to update reservation:", error);
    return { success: false, error: message };
  }
}

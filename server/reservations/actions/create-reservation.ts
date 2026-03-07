"use server";

import type { ActionResult } from "@/lib/types";
import { createReservationSchema } from "../schemas/reservation.schema";
import { reservationService } from "../services/reservation.service";

export async function createReservation(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createReservationSchema.safeParse({
    tableId: formData.get("tableId"),
    restaurantId: formData.get("restaurantId"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    guestCount: Number(formData.get("guestCount")),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const reservation = await reservationService.create(parsed.data);
    return { success: true, data: { id: reservation.id } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create reservation";
    console.error("Failed to create reservation:", error);
    return { success: false, error: message };
  }
}

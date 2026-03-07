"use server";

import type { ActionResult } from "@/lib/types";
import { reservationService } from "../services/reservation.service";

export async function getUserReservations(): Promise<
  ActionResult<
    Array<{
      id: string;
      startTime: Date;
      endTime: Date;
      guestCount: number;
      status: string;
      notes: string | null;
      createdAt: Date;
      table: { label: string };
      restaurant: { id: string; name: string };
    }>
  >
> {
  try {
    const reservations = await reservationService.findByUserId();
    return { success: true, data: reservations };
  } catch (error) {
    console.error("Failed to get user reservations:", error);
    return { success: false, error: "Failed to get your reservations" };
  }
}

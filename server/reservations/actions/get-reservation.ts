"use server";

import type { ActionResult } from "@/lib/types";
import { reservationService } from "../services/reservation.service";

export async function getReservation(
  id: string,
): Promise<
  ActionResult<{
    id: string;
    startTime: Date;
    endTime: Date;
    guestCount: number;
    status: string;
    notes: string | null;
    userId: string;
    tableId: string;
    restaurantId: string;
    createdAt: Date;
    table: { label: string; capacity: number };
    restaurant: { name: string };
  }>
> {
  try {
    const reservation = await reservationService.findById(id);
    return { success: true, data: reservation };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get reservation";
    console.error("Failed to get reservation:", error);
    return { success: false, error: message };
  }
}

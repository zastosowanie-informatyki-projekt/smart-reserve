"use server";

import type { ActionResult } from "@/lib/types";
import { reservationService } from "../services/reservation.service";

export async function getRestaurantReservations(
  restaurantId: string,
  filters?: { from?: string; to?: string },
): Promise<
  ActionResult<
    Array<{
      id: string;
      startTime: Date;
      endTime: Date;
      guestCount: number;
      status: string;
      notes: string | null;
      createdAt: Date;
      table: { id: string; label: string };
      user: { id: string; name: string; email: string };
    }>
  >
> {
  try {
    const dateFilters = {
      from: filters?.from ? new Date(filters.from) : undefined,
      to: filters?.to ? new Date(filters.to) : undefined,
    };
    const reservations = await reservationService.findByRestaurantId(
      restaurantId,
      dateFilters,
    );
    return { success: true, data: reservations };
  } catch (error) {
    console.error("Failed to get restaurant reservations:", error);
    return { success: false, error: "Failed to get restaurant reservations" };
  }
}

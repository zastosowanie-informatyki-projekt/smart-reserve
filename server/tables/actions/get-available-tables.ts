"use server";

import type { ActionResult } from "@/lib/types";
import { tableService } from "../services/table.service";

export async function getAvailableTables(input: {
  restaurantId: string;
  startTime: string;
  endTime: string;
  guestCount: number;
}): Promise<
  ActionResult<
    Array<{
      id: string;
      label: string;
      capacity: number;
      description: string | null;
    }>
  >
> {
  try {
    const tables = await tableService.findAvailable(input);
    return { success: true, data: tables };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search for available tables";
    console.error("Failed to get available tables:", error);
    return { success: false, error: message };
  }
}

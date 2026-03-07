"use server";

import type { ActionResult } from "@/lib/types";
import { tableService } from "../services/table.service";

export async function getTables(restaurantId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      label: string;
      capacity: number;
      description: string | null;
      isActive: boolean;
    }>
  >
> {
  try {
    const tables = await tableService.findByRestaurantId(restaurantId);
    return { success: true, data: tables };
  } catch (error) {
    console.error("Failed to get tables:", error);
    return { success: false, error: "Failed to get tables" };
  }
}

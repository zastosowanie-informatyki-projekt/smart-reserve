"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { tableService } from "../services/table.service";

export async function deleteTable(id: string): Promise<ActionResult> {
  try {
    await tableService.delete(id);
    revalidatePath("/dashboard", "layout");
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("UPCOMING_RESERVATIONS:")) {
      const count = Number(error.message.split(":")[1] ?? "0");
      const suffix = count === 1 ? "reservation" : "reservations";
      return {
        success: false,
        error: `Cannot delete this table because it has ${count} upcoming ${suffix}.`,
      };
    }

    console.error("Failed to delete table:", error);
    return { success: false, error: "Failed to delete table" };
  }
}

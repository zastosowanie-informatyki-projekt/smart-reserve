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
    console.error("Failed to delete table:", error);
    return { success: false, error: "Failed to delete table" };
  }
}

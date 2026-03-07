"use server";

import type { ActionResult } from "@/lib/types";
import { updateTableSchema } from "../schemas/table.schema";
import { tableService } from "../services/table.service";

export async function updateTable(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateTableSchema.safeParse({
    id: formData.get("id"),
    label: formData.get("label") || undefined,
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : undefined,
    description: formData.get("description") || undefined,
    isActive: formData.get("isActive")
      ? formData.get("isActive") === "true"
      : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const table = await tableService.update(parsed.data);
    return { success: true, data: { id: table.id } };
  } catch (error) {
    console.error("Failed to update table:", error);
    return { success: false, error: "Failed to update table" };
  }
}

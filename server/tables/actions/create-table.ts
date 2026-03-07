"use server";

import type { ActionResult } from "@/lib/types";
import { createTableSchema } from "../schemas/table.schema";
import { tableService } from "../services/table.service";

export async function createTable(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createTableSchema.safeParse({
    restaurantId: formData.get("restaurantId"),
    label: formData.get("label"),
    capacity: Number(formData.get("capacity")),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const table = await tableService.create(parsed.data);
    return { success: true, data: { id: table.id } };
  } catch (error) {
    console.error("Failed to create table:", error);
    return { success: false, error: "Failed to create table" };
  }
}

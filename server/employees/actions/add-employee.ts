"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { employeeService } from "../services/employee.service";

export async function addEmployee(
  userId: string,
  restaurantId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const record = await employeeService.addEmployee(userId, restaurantId);
    revalidatePath(`/dashboard/${restaurantId}`);
    return { success: true, data: { id: record.id } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add employee";
    console.error("Failed to add employee:", error);
    return { success: false, error: message };
  }
}

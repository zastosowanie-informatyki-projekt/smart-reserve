"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { employeeService } from "../services/employee.service";

export async function removeEmployee(
  employeeRecordId: string,
  restaurantId: string,
): Promise<ActionResult> {
  try {
    await employeeService.removeEmployee(employeeRecordId, restaurantId);
    revalidatePath(`/dashboard/${restaurantId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to remove employee:", error);
    return { success: false, error: "Failed to remove employee" };
  }
}

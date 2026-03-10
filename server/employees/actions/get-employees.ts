"use server";

import type { ActionResult } from "@/lib/types";
import { employeeService } from "../services/employee.service";

export async function getEmployees(restaurantId: string): Promise<
  ActionResult<
    Array<{
      id: string;
      createdAt: Date;
      user: { id: string; name: string; email: string; image: string | null };
    }>
  >
> {
  try {
    const employees = await employeeService.getEmployees(restaurantId);
    return { success: true, data: employees };
  } catch (error) {
    console.error("Failed to get employees:", error);
    return { success: false, error: "Failed to get employees" };
  }
}

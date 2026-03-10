"use server";

import type { ActionResult } from "@/lib/types";
import { employeeService } from "../services/employee.service";

export async function searchEmployees(
  query: string,
  restaurantId: string,
): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      email: string;
      image: string | null;
    }>
  >
> {
  try {
    const results = await employeeService.searchEmployees(query, restaurantId);
    return { success: true, data: results };
  } catch (error) {
    console.error("Failed to search employees:", error);
    return { success: false, error: "Failed to search employees" };
  }
}

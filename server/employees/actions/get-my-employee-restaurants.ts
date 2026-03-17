"use server";

import { CuisineType } from "@/app/generated/prisma/client";
import type { ActionResult } from "@/lib/types";
import { employeeService } from "../services/employee.service";

export async function getMyEmployeeRestaurants(): Promise<
  ActionResult<
    Array<{
      id: string;
      createdAt: Date;
      restaurant: {
        id: string;
        name: string;
        city: string;
        cuisines: CuisineType[];
        imageUrl: string | null;
      };
    }>
  >
> {
  try {
    const restaurants = await employeeService.getMyRestaurants();
    return { success: true, data: restaurants };
  } catch (error) {
    console.error("Failed to get employee restaurants:", error);
    return { success: false, error: "Failed to get your restaurants" };
  }
}

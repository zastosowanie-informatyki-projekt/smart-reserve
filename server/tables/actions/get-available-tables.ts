"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

export async function getAvailableTables(input: {
  restaurantId: string;
  startTime: string;
  endTime: string;
  guestCount: number;
}): Promise<
  ActionResult<
    Array<{
      id: string;
      label: string;
      capacity: number;
      description: string | null;
    }>
  >
> {
  try {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { success: false, error: "Invalid date format" };
    }
    if (startTime >= endTime) {
      return { success: false, error: "Start time must be before end time" };
    }
    if (startTime < new Date()) {
      return { success: false, error: "Cannot search for times in the past" };
    }
    if (input.guestCount < 1) {
      return { success: false, error: "Guest count must be at least 1" };
    }

    const tables = await prisma.restaurantTable.findMany({
      where: {
        restaurantId: input.restaurantId,
        isActive: true,
        capacity: { gte: input.guestCount },
        reservations: {
          none: {
            status: { notIn: ["CANCELLED", "NO_SHOW"] },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        },
      },
      select: {
        id: true,
        label: true,
        capacity: true,
        description: true,
      },
      orderBy: { capacity: "asc" },
    });

    return { success: true, data: tables };
  } catch (error) {
    console.error("Failed to get available tables:", error);
    return { success: false, error: "Failed to search for available tables" };
  }
}

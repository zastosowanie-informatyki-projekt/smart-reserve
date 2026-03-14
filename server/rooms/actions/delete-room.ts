"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { roomService } from "../services/room.service";

export async function deleteRoom(
  id: string,
  force = false,
): Promise<ActionResult<{ upcomingReservations?: number }>> {
  try {
    await roomService.delete(id, force);
    revalidatePath("/dashboard", "layout");
    return { success: true, data: {} };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("UPCOMING_RESERVATIONS:")) {
      const count = Number(error.message.split(":")[1]);
      return { success: true, data: { upcomingReservations: count } };
    }
    console.error("Failed to delete room:", error);
    return { success: false, error: "Failed to delete room" };
  }
}

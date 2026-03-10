"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { roomService } from "../services/room.service";

export async function deleteRoom(id: string): Promise<ActionResult> {
  try {
    await roomService.delete(id);
    revalidatePath("/dashboard", "layout");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete room:", error);
    return { success: false, error: "Failed to delete room" };
  }
}

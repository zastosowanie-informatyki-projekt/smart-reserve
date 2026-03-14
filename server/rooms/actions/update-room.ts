"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { updateRoomSchema } from "../schemas/room.schema";
import { roomService } from "../services/room.service";

export async function updateRoom(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateRoomSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const room = await roomService.update(parsed.data);
    revalidatePath(`/dashboard/${room.restaurantId}`);
    return { success: true, data: { id: room.id } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update room";
    console.error("Failed to update room:", error);
    return { success: false, error: message };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { createRoomSchema } from "../schemas/room.schema";
import { roomService } from "../services/room.service";

export async function createRoom(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createRoomSchema.safeParse({
    restaurantId: formData.get("restaurantId"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const room = await roomService.create(parsed.data);
    revalidatePath(`/dashboard/${parsed.data.restaurantId}`);
    return { success: true, data: { id: room.id } };
  } catch (error) {
    console.error("Failed to create room:", error);
    return { success: false, error: "Failed to create room" };
  }
}

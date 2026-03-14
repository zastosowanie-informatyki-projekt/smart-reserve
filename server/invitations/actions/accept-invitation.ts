"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { invitationService } from "../services/invitation.service";

export async function acceptInvitation(
  id: string,
): Promise<ActionResult<{ restaurantId: string; restaurantName: string }>> {
  try {
    const result = await invitationService.accept(id);
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to accept invitation";
    console.error("Failed to accept invitation:", error);
    return { success: false, error: message };
  }
}

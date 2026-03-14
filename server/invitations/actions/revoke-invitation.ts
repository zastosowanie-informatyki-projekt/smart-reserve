"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { invitationService } from "../services/invitation.service";

export async function revokeInvitation(
  id: string,
  restaurantId: string,
): Promise<ActionResult> {
  try {
    await invitationService.revoke(id, restaurantId);
    revalidatePath(`/dashboard/${restaurantId}`);
    return { success: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to revoke invitation";
    console.error("Failed to revoke invitation:", error);
    return { success: false, error: message };
  }
}

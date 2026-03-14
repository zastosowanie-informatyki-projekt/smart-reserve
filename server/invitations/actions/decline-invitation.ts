"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { invitationService } from "../services/invitation.service";

export async function declineInvitation(id: string): Promise<ActionResult> {
  try {
    await invitationService.decline(id);
    revalidatePath("/invitations");
    return { success: true, data: undefined };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to decline invitation";
    console.error("Failed to decline invitation:", error);
    return { success: false, error: message };
  }
}

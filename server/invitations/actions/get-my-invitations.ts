"use server";

import type { ActionResult } from "@/lib/types";
import { invitationService } from "../services/invitation.service";

export async function getMyInvitations(): Promise<
  ActionResult<
    Array<{
      id: string;
      createdAt: Date;
      restaurant: {
        id: string;
        name: string;
        city: string;
        cuisine: string | null;
        imageUrl: string | null;
      };
    }>
  >
> {
  try {
    const invitations = await invitationService.getMyInvitations();
    return { success: true, data: invitations };
  } catch (error) {
    console.error("Failed to get invitations:", error);
    return { success: false, error: "Failed to get your invitations" };
  }
}

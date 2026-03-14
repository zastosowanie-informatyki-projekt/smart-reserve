"use server";

import type { ActionResult } from "@/lib/types";
import { invitationService } from "../services/invitation.service";

export async function getInvitations(
  restaurantId: string,
): Promise<
  ActionResult<
    Array<{
      id: string;
      email: string;
      token: string;
      expiresAt: Date;
      createdAt: Date;
    }>
  >
> {
  try {
    const invitations = await invitationService.getForRestaurant(restaurantId);
    return { success: true, data: invitations };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get invitations";
    console.error("Failed to get invitations:", error);
    return { success: false, error: message };
  }
}

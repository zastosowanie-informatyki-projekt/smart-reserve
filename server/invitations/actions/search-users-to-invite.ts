"use server";

import type { ActionResult } from "@/lib/types";
import { invitationService } from "../services/invitation.service";

export async function searchUsersToInvite(
  query: string,
  restaurantId: string,
): Promise<
  ActionResult<
    Array<{
      id: string;
      name: string;
      email: string;
      image: string | null;
    }>
  >
> {
  try {
    const users = await invitationService.searchUsersToInvite(query, restaurantId);
    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to search users:", error);
    return { success: false, error: "Failed to search users" };
  }
}
